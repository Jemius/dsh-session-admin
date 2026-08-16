/**
 * The /session-manager JSON API: archived-chat listing, transcript reading,
 * restore, export, and permanent deletion. Every method returns the shared
 * wire envelope ({ok:true,value} | {ok:false,error:{code,message}}) and runs
 * inside the caller's route handler, which already applied the trust fence.
 *
 * Deletion contract (the harness has no persistence deletion API, so this
 * plugin performs the documented out-of-band maintenance, mirroring the
 * ordering dsh-chat-manager validates):
 * - only ARCHIVED sessions are deletable from this surface,
 * - a session whose agent is actually RUNNING (an open, unfinished turn)
 *   refuses; an idle live session is retired from the in-memory store first,
 * - artifact removal happens BEFORE the durable workspace state changes, and
 *   the archive-set removal runs LAST — a failure anywhere earlier leaves the
 *   archive intact, so a broken delete can never resurrect the session,
 * - the workspace accounts, the projection cache row, and the archive-set id
 *   are all pruned so no stale reference survives the delete.
 */
import { basename, dirname } from 'node:path'
import { rm } from 'node:fs/promises'
import type {
  ApiResult,
  ArchivedChatItem,
  ExportValue,
  HostContext,
  SessionHeaderLike,
  SessionStoreLike,
  SurfaceEventLike,
  TranscriptMessage,
  TranscriptValue,
} from './types.ts'

/** Business error with a wire code. */
export class ArchiveApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

/** Bounds: the viewer renders a bounded transcript, never a whole log. */
const MAX_TRANSCRIPT_EVENTS = 400
const MAX_TEXT_CHARS = 8000
const MAX_TOOL_INPUT_CHARS = 400

/** Cap a string for the wire; returns `''` for non-strings. */
function capText(value: unknown, max = MAX_TEXT_CHARS): string {
  if (typeof value !== 'string') return ''
  return value.length > max ? `${value.slice(0, max)}…` : value
}

/** Extract the readable text of one content block (tolerant). */
function blockText(block: unknown): string {
  if (block === null || typeof block !== 'object') return ''
  const record = block as Record<string, unknown>
  const type = record.type
  if ((type === 'text' || type === 'markdown' || type === 'reasoning' || type === 'context') && typeof record.text === 'string') {
    return record.text
  }
  return ''
}

/** Join the readable text of a message's content blocks. */
function contentText(content: unknown): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  return content.map(blockText).filter(text => text !== '').join('\n')
}

/**
 * Tool-call chips of an assistant message. Real block shape:
 * `{ type: 'tool-call', id, name, arguments: string }` (the arguments are a
 * raw JSON string, not an object). Also fills the `callNames` map so the
 * matching tool/result row can show the tool name (tool-result blocks carry
 * no name of their own).
 */
function toolCallsOf(content: unknown, callNames: Map<string, string>): Array<{ name: string; inputText: string }> {
  if (!Array.isArray(content)) return []
  const calls: Array<{ name: string; inputText: string }> = []
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const record = block as Record<string, unknown>
    if (record.type !== 'tool-call') continue
    const name = typeof record.name === 'string' ? record.name : 'tool'
    if (typeof record.id === 'string' && record.id !== '') callNames.set(record.id, name)
    const argumentsRaw = typeof record.arguments === 'string' ? record.arguments : ''
    calls.push({ name, inputText: capText(argumentsRaw, MAX_TOOL_INPUT_CHARS) })
  }
  return calls
}

/** The tool-call id a tool/result message correlates with. */
function toolCallIdOf(data: Record<string, unknown>): string | undefined {
  const content = data.content
  if (!Array.isArray(content)) return undefined
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const record = block as Record<string, unknown>
    if (record.type === 'tool-result' && typeof record.toolCallId === 'string') return record.toolCallId
  }
  return undefined
}

/** Whether a tool/result message reports failure. */
function toolResultIsError(data: Record<string, unknown>): boolean {
  const content = data.content
  if (!Array.isArray(content)) return false
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const record = block as Record<string, unknown>
    if (record.type === 'tool-result' && record.isError === true) return true
  }
  return false
}

/**
 * Tool-result text. Real block shape: `{ type: 'tool-result', toolCallId,
 * content: ContentBlock[] | string, isError }` — descend into the nested
 * content blocks, then fall back to a JSON rendering.
 */
function toolResultText(data: Record<string, unknown>): string {
  const content = data.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block === null || typeof block !== 'object') continue
      const record = block as Record<string, unknown>
      if (record.type !== 'tool-result') continue
      if (typeof record.content === 'string') return record.content
      if (Array.isArray(record.content)) return contentText(record.content)
      if (record.content !== undefined) {
        try {
          return JSON.stringify(record.content)
        } catch {
          return ''
        }
      }
    }
    const text = contentText(content)
    if (text !== '') return text
  }
  try {
    return JSON.stringify(content)
  } catch {
    return ''
  }
}

/** Map one surface event to a transcript row, or undefined for boundaries.
 *  Exported for unit tests.
 *  Event data shapes (dsh-session types): `user/message` carries the
 *  UserMessage directly; `assistant/message` and `tool/result` carry
 *  `{ turn, step, message }`; the log-only `tool/call` event is the
 *  authoritative callId→name source and is handled by the caller. */
export function transcriptMessageOf(
  event: SurfaceEventLike,
  callNames: Map<string, string>,
): TranscriptMessage | undefined {
  const data = event.data ?? {}
  if (event.type === 'user/message') {
    return { kind: 'user', seq: event.seq, time: event.time, text: contentText(data.content) }
  }
  if (event.type === 'assistant/message') {
    const message = (data.message ?? {}) as Record<string, unknown>
    return {
      kind: 'assistant',
      seq: event.seq,
      time: event.time,
      text: contentText(message.content),
      toolCalls: toolCallsOf(message.content, callNames),
    }
  }
  if (event.type === 'tool/result') {
    const message = (data.message ?? data) as Record<string, unknown>
    const callId = toolCallIdOf(message)
    const toolName = callId === undefined ? undefined : callNames.get(callId)
    return {
      kind: 'tool',
      seq: event.seq,
      time: event.time,
      text: capText(toolResultText(message)),
      toolName,
      isError: toolResultIsError(message) || (data.error !== undefined),
    }
  }
  return undefined
}

/** Fold the log-only `tool/call` events into the callId→name map. */
export function collectToolCallNames(event: SurfaceEventLike, callNames: Map<string, string>): void {
  if (event.type !== 'tool/call') return
  const data = event.data ?? {}
  if (typeof data.callId === 'string' && typeof data.name === 'string') {
    callNames.set(data.callId, data.name)
  }
}

/** Whether a live session has an OPEN turn — the only state that means the
 *  session is genuinely in use (its agent is executing). A session that was
 *  merely opened/archived is idle. */
export function sessionHasOpenTurn(session: { events?: readonly { type: string }[] }): boolean {
  const events = session.events
  if (events === undefined || events.length === 0) return false
  for (let index = events.length - 1; index >= 0; index--) {
    const type = events[index].type
    if (type === 'turn/end' || type === 'session/end-seed') return false
    if (type === 'turn/start') return true
  }
  return false
}

/** Resolve the archived list from the registry's archive set, newest first.
 *  The `live` flag means the agent is genuinely RUNNING (open turn) — a
 *  session merely present in memory is idle and shows no status. */
export async function listArchived(ctx: HostContext): Promise<ArchivedChatItem[]> {
  const archived = ctx.workspaceRegistry.archivedSessionIds.map(id => String(id))
  const sessions = ctx.get('sessions') as SessionStoreLike | undefined
  const persistence = ctx.get('sessionPersistence') as { list(signal?: AbortSignal): Promise<SessionHeaderLike[]> } | undefined
  const query = ctx.get('sessionQuery') as { readTitle(id: string): Promise<{ title: string } | undefined> } | undefined

  const headers = new Map<string, SessionHeaderLike>()
  if (persistence !== undefined) {
    try {
      for (const header of await persistence.list()) headers.set(String(header.id), header)
    } catch (error) {
      ctx.logger.warn(`[dsh-session-manager] persistence list failed: ${String(error)}`)
    }
  }
  for (const id of archived) {
    const live = sessions?.get(id)
    if (live !== undefined) headers.set(id, live.header)
  }

  const items: ArchivedChatItem[] = []
  for (const id of archived) {
    const header = headers.get(id)
    if (header === undefined) continue // deleted (or unknown) id: pruned from the view
    let title: string | null = null
    if (query !== undefined) {
      try {
        title = (await query.readTitle(id))?.title ?? null
      } catch (error) {
        ctx.logger.warn(`[dsh-session-manager] title read failed for ${id}: ${String(error)}`)
      }
    }
    const running = sessions?.get(id) !== undefined && sessionHasOpenTurn(sessions.get(id)!)
    const cwd = header.cwd ?? null
    const cwdBase = cwd === null ? '' : (basename(cwd.replace(/[\\/]+$/, '')) || cwd)
    items.push({
      sessionId: id,
      title,
      displayTitle: title ?? (cwdBase !== '' ? cwdBase : id),
      createdAt: header.createdAt,
      cwd,
      live: running,
    })
  }
  items.sort((a, b) => b.createdAt - a.createdAt)
  return items
}

/** Read one session's current surface as viewer-ready transcript rows. */
export async function readTranscript(ctx: HostContext, sessionId: string): Promise<TranscriptValue> {
  const query = ctx.get('sessionQuery') as { readSurface(id: string): Promise<{ session: SessionHeaderLike; events: SurfaceEventLike[] }>; readTitle(id: string): Promise<{ title: string } | undefined> } | undefined
  if (query === undefined) {
    throw new ArchiveApiError('unavailable', 'this deployment does not mount the session query service')
  }
  if (!ctx.workspaceRegistry.archivedSessionIds.some(id => String(id) === sessionId)) {
    throw new ArchiveApiError('not-archived', 'this session is not in the archive')
  }
  const surface = await query.readSurface(sessionId)
  const truncated = surface.events.length > MAX_TRANSCRIPT_EVENTS
  const callNames = new Map<string, string>()
  // Fold the whole log's tool/call events first so names resolve even when
  // the paired call sits outside the bounded viewer window.
  for (const event of surface.events) collectToolCallNames(event, callNames)
  const rows: TranscriptMessage[] = []
  for (const event of surface.events.slice(-MAX_TRANSCRIPT_EVENTS)) {
    const message = transcriptMessageOf(event, callNames)
    if (message !== undefined) rows.push(message)
  }
  let title: string | null = null
  try {
    title = (await query.readTitle(sessionId))?.title ?? null
  } catch {
    title = null
  }
  return {
    sessionId,
    title,
    createdAt: surface.session.createdAt,
    cwd: surface.session.cwd ?? null,
    messages: rows,
    truncated,
  }
}

/** Remove a session id from the durable archive set (the registry's own
 *  state write path — the domain write fans `host/archived-sessions-changed`
 *  to every browser, restoring the session to its workspace position). */
async function unarchiveSession(ctx: HostContext, sessionId: string): Promise<void> {
  const registry = ctx.workspaceRegistry
  const state = registry.requireState()
  if (!state.archivedSessionIds.some(id => String(id) === sessionId)) return
  await registry.setState({
    ...state,
    archivedSessionIds: state.archivedSessionIds.filter(id => String(id) !== sessionId),
  })
}

/** Restore one archived session to its original workspace position. */
export async function restoreArchived(ctx: HostContext, sessionId: string): Promise<ArchivedChatItem[]> {
  if (!ctx.workspaceRegistry.archivedSessionIds.some(id => String(id) === sessionId)) {
    throw new ArchiveApiError('not-archived', 'this session is not in the archive')
  }
  await unarchiveSession(ctx, sessionId)
  return listArchived(ctx)
}

/** Build one export artifact for a session.
 *  - `jsonl`: every raw log event, one JSON object per line (byte-identical
 *    to the durable artifact's event stream, minus the storage encoding).
 *  - `markdown`: a human-readable transcript of the current surface. */
export async function exportSession(ctx: HostContext, sessionId: string, format: 'markdown' | 'jsonl'): Promise<ExportValue> {
  const query = ctx.get('sessionQuery') as {
    readSession(id: string): Promise<{ session: SessionHeaderLike; events: SurfaceEventLike[] }>
    readSurface(id: string): Promise<{ session: SessionHeaderLike; events: SurfaceEventLike[] }>
    readTitle(id: string): Promise<{ title: string } | undefined>
  } | undefined
  if (query === undefined) {
    throw new ArchiveApiError('unavailable', 'this deployment does not mount the session query service')
  }
  if (!ctx.workspaceRegistry.archivedSessionIds.some(id => String(id) === sessionId)) {
    throw new ArchiveApiError('not-archived', 'this session is not in the archive')
  }
  let title: string | null = null
  try {
    title = (await query.readTitle(sessionId))?.title ?? null
  } catch {
    title = null
  }

  if (format === 'jsonl') {
    const log = await query.readSession(sessionId)
    const lines: string[] = []
    for (const event of log.events) {
      try {
        lines.push(JSON.stringify(event))
      } catch {
        lines.push(JSON.stringify({ type: event.type, seq: event.seq, time: event.time, data: null }))
      }
    }
    return {
      filename: `${sessionId}.jsonl`,
      contentType: 'application/x-ndjson',
      content: lines.join('\n'),
    }
  }

  const surface = await query.readSurface(sessionId)
  const callNames = new Map<string, string>()
  for (const event of surface.events) collectToolCallNames(event, callNames)
  const date = new Date(surface.session.createdAt)
  const pad = (value: number): string => String(value).padStart(2, '0')
  const lines: string[] = []
  lines.push(`# ${title ?? sessionId}`)
  lines.push('')
  lines.push(`- Session: \`${sessionId}\``)
  lines.push(`- Created: ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`)
  if (surface.session.cwd !== undefined) lines.push(`- Cwd: \`${surface.session.cwd}\``)
  lines.push('')
  for (const event of surface.events) {
    const message = transcriptMessageOf(event, callNames)
    if (message === undefined) continue
    if (message.kind === 'user') {
      lines.push('## 用户 / User')
      lines.push(message.text)
    } else if (message.kind === 'assistant') {
      lines.push('## 助手 / Assistant')
      if (message.text !== '') lines.push(message.text)
      for (const call of message.toolCalls ?? []) {
        lines.push(`> 调用工具 / tool: **${call.name}** ${call.inputText !== '' ? `\`${call.inputText}\`` : ''}`)
      }
    } else {
      lines.push(`## 工具结果 / Tool result${message.toolName !== undefined ? ` · ${message.toolName}` : ''}${message.isError === true ? ' (error)' : ''}`)
      lines.push(message.text === '' ? '_（无文本输出 / no text output）_' : message.text)
    }
    lines.push('')
  }
  return {
    filename: `${title ?? sessionId}.md`,
    contentType: 'text/markdown; charset=utf-8',
    content: lines.join('\n'),
  }
}

/**
 * Retire an IDLE live session from the in-memory store (defensive use of the
 * store's own detach primitive), so deleting its artifact cannot be undone by
 * a later flush from the leftover object. `session/disposed` lets the
 * persistence coordinator drain and release its per-id state. A failure only
 * warns: the artifact removal below still goes through.
 */
async function detachIdleLiveSession(ctx: HostContext, sessions: unknown, sessionId: string): Promise<void> {
  const store = sessions as { store?: Map<string, unknown>; detachEntered?(entry: unknown): void }
  try {
    const entry = store.store?.get(sessionId)
    if (entry === undefined || store.detachEntered === undefined) return
    if ((entry as { id?: string })?.id !== sessionId) return
    store.detachEntered(entry)
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] failed to detach idle live session ${sessionId}: ${String(error)}`)
  }
}

/**
 * Permanently delete one archived session, mirroring the ordering
 * dsh-chat-manager validates:
 *  1. refuse a session whose agent is RUNNING; retire an idle live session,
 *  2. remove the durable artifact (fail loud — nothing else changed yet),
 *  3. prune the workspace accounts (best-effort; missing headers self-heal),
 *  4. prune the projection-cache row (best-effort hygiene),
 *  5. remove the archive-set id LAST (only a fully successful delete does).
 */
export async function deleteArchived(ctx: HostContext, sessionId: string): Promise<ArchivedChatItem[]> {
  if (!ctx.workspaceRegistry.archivedSessionIds.some(id => String(id) === sessionId)) {
    throw new ArchiveApiError('not-archived', 'only archived chats can be permanently deleted')
  }
  const sessions = ctx.get('sessions') as SessionStoreLike | undefined
  const live = sessions?.get(sessionId)
  if (live !== undefined) {
    if (sessionHasOpenTurn(live)) {
      throw new ArchiveApiError('session-active', 'this session is currently running — wait for it to finish before deleting')
    }
    await detachIdleLiveSession(ctx, sessions, sessionId)
    // Let the persistence coordinator's session/disposed final drain settle
    // before removing the artifact it just flushed (idle sessions have no
    // pending events, so this is a short no-op pause).
    await new Promise(resolve => setTimeout(resolve, 60))
  }
  const persistence = ctx.get('sessionPersistence') as {
    list(signal?: AbortSignal): Promise<SessionHeaderLike[]>
    locate(meta: SessionHeaderLike): { kind: string; path: string } | undefined
  } | undefined
  if (persistence !== undefined) {
    const headers = await persistence.list()
    const meta = headers.find(header => String(header.id) === sessionId)
    if (meta !== undefined) {
      const location = persistence.locate(meta)
      if (location === undefined) {
        throw new ArchiveApiError('unsupported-backend', 'the active session backend exposes no per-session artifact to delete')
      }
      if (location.kind === 'jsonl') {
        // Sanity: only remove a session-owned directory holding the fixed
        // transcript filename — never an arbitrary path.
        const dir = dirname(location.path)
        const dirName = basename(dir)
        const fileName = basename(location.path)
        if (!dirName.startsWith('session-') || !/^session\.jsonl(\.zstd)?$/.test(fileName)) {
          throw new ArchiveApiError('unsafe-path', 'the resolved artifact path failed safety checks; refusing to delete')
        }
        await rm(dir, { recursive: true, force: true })
      } else {
        throw new ArchiveApiError('unsupported-backend', `deleting ${location.kind} artifacts is not supported`)
      }
    }
    // Not persisted (e.g. a zero-event blank session): nothing on disk to remove.
  }

  // Workspace accounting: detach the session from every workspace account
  // (the registry's sanctioned write path). Best-effort: a failure only
  // warns — the `sessionIds` projection already filters missing headers.
  try {
    for (const workspace of ctx.workspaceRegistry.list()) {
      if (workspace.sessionIds.some(id => String(id) === sessionId)) {
        await workspace.detachSession(sessionId)
      }
    }
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] workspace account cleanup failed for ${sessionId}: ${String(error)}`)
  }

  // Projection-cache row cleanup (the platform has no prune path; rows are
  // never authoritative, so this is pure hygiene).
  try {
    const cacheDomain = ctx.get('storageDomain')?.get('session_projcache')
    const cacheTable = cacheDomain?.table('sessions')
    if (cacheTable !== undefined) await cacheTable.delete(sessionId)
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] projection cache cleanup failed for ${sessionId}: ${String(error)}`)
  }

  // Archive-set removal LAST: every fallible step above has succeeded.
  await unarchiveSession(ctx, sessionId)
  return listArchived(ctx)
}

/** Route one method call through the API table. */
export async function callApi(ctx: HostContext, method: string, payload: Record<string, unknown>): Promise<ApiResult<unknown>> {
  try {
    if (method === 'list') {
      return { ok: true, value: { items: await listArchived(ctx) } }
    }
    if (method === 'read') {
      const sessionId = payload.sessionId
      if (typeof sessionId !== 'string' || sessionId === '') throw new ArchiveApiError('bad-request', 'sessionId is required')
      return { ok: true, value: await readTranscript(ctx, sessionId) }
    }
    if (method === 'restore') {
      const sessionId = payload.sessionId
      if (typeof sessionId !== 'string' || sessionId === '') throw new ArchiveApiError('bad-request', 'sessionId is required')
      return { ok: true, value: { items: await restoreArchived(ctx, sessionId) } }
    }
    if (method === 'export') {
      const sessionId = payload.sessionId
      if (typeof sessionId !== 'string' || sessionId === '') throw new ArchiveApiError('bad-request', 'sessionId is required')
      const format = payload.format === 'jsonl' ? 'jsonl' : 'markdown'
      return { ok: true, value: await exportSession(ctx, sessionId, format) }
    }
    if (method === 'delete') {
      const sessionId = payload.sessionId
      if (typeof sessionId !== 'string' || sessionId === '') throw new ArchiveApiError('bad-request', 'sessionId is required')
      return { ok: true, value: { items: await deleteArchived(ctx, sessionId) } }
    }
    throw new ArchiveApiError('not-found', `unknown session-manager API method "${method}"`)
  } catch (error) {
    if (error instanceof ArchiveApiError) {
      return { ok: false, error: { code: error.code, message: error.message } }
    }
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: { code: 'internal', message } }
  }
}
