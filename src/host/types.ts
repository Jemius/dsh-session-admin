/**
 * Structural service faces the host half reads through the cordis context.
 * A third-party plugin resolves outside the DSH monorepo's single cordis
 * instance, so the upstream `declare module 'cordis'` augmentations do not
 * reach this Context — the mirrors below restate only the exact runtime
 * shapes this plugin touches (the same discipline dsh-better-sidebar uses).
 * This file stays free of React/browser types; it is host-only.
 */

/** The request face route handlers see (structural subset of node:http). */
export interface HttpRequestLike {
  url?: string
  method?: string
  headers: Record<string, string | string[] | undefined>
  [Symbol.asyncIterator](): AsyncIterator<string | Uint8Array>
}

/** The response face route handlers write to. */
export interface HttpResponseLike {
  statusCode: number
  writeHead(status: number, headers?: Record<string, string>): void
  end(body?: string | Uint8Array): void
}

/** One named webserver route (mirror of dsh-host-webserver's WebRoute). */
export interface WebRouteLike {
  kind: 'exact' | 'prefix'
  path: string
  handler: (req: HttpRequestLike, res: HttpResponseLike) => void | Promise<void>
}

/** The webServer service face this plugin uses. */
export interface WebServerLike {
  register(route: WebRouteLike): () => void
}

/** The web runtime's bind-derived trust list (mirror of dsh-web-app). */
export interface WebRuntimeLike {
  trustedHosts: readonly string[]
}

/** One persisted-session header slice (mirror of SessionHeader). */
export interface SessionHeaderLike {
  id: string
  version: number
  createdAt: number
  cwd?: string
  parentSession?: string
  seedLength?: number
  origin?: string
  delegationDepth?: number
  agentPreset?: string
}

/** One workspace entity face (session account + detach). */
export interface WorkspaceEntityLike {
  id: string
  sessionIds: readonly string[]
  detachSession(sessionId: string): Promise<void> | void
}

/**
 * The workspace registry face (archive set + membership). `requireState` /
 * `setState` are the registry's own public state methods (the same path the
 * stock `archiveSession` uses), so mutating the archive set here keeps the
 * in-memory registry and the durable workspace domain in sync — the domain
 * write fans the `host/archived-sessions-changed` frame to every browser.
 */
export interface WorkspaceRegistryLike {
  readonly archivedSessionIds: readonly string[]
  archiveSession(sessionId: string): Promise<void> | void
  list(): WorkspaceEntityLike[]
  requireState(): { archivedSessionIds: readonly string[]; workspaceIds?: readonly string[] }
  setState(state: Record<string, unknown>): Promise<void> | void
}

/** The storage domain face (projection-cache hygiene on delete). */
export interface StorageDomainLike {
  get(domain: string): { table(name: string): { delete(key: string): Promise<void> | void } | undefined } | undefined
}

/** The session persistence seam face (list + artifact location). */
export interface SessionPersistenceLike {
  list(signal?: AbortSignal): Promise<SessionHeaderLike[]>
  locate(meta: SessionHeaderLike): SessionLocationLike | undefined
}

/** One per-session artifact target (mirror of SessionLocation). */
export interface SessionLocationLike {
  kind: string
  path: string
}

/** The live session store face (live lookup + the append-only event log). */
export interface SessionStoreLike {
  get(id: string): { header: SessionHeaderLike; events?: readonly { type: string }[] } | undefined
  /** Internal store map + detach primitive (used defensively to retire idle live sessions). */
  store?: Map<string, unknown>
  detachEntered?(entry: unknown): void
}

/** Latest-folded session title snapshot (mirror of SessionTitleSnapshot). */
export interface SessionTitleSnapshotLike {
  title: string
  seq?: number
  time?: number
}

/** The session query engine face: titles, surface, and the raw log for export. */
export interface SessionQueryLike {
  readTitle(sessionId: string, signal?: AbortSignal): Promise<SessionTitleSnapshotLike | undefined>
  readSurface(sessionId: string): Promise<SessionSurfaceLike>
  readSession(sessionId: string): Promise<{ session: SessionHeaderLike; events: SurfaceEventLike[] }>
}

/** One current-surface observation (mirror of SessionSurfaceSnapshot). */
export interface SessionSurfaceLike {
  session: SessionHeaderLike
  capturedThroughSeq: number | null
  events: SurfaceEventLike[]
}

/** One surface event (tolerant structural mirror). */
export interface SurfaceEventLike {
  type: string
  seq: number
  time: number
  data: Record<string, unknown>
}

/** The webServer register effect helper carried by the vendored cordis. */
export interface HostContext {
  webServer: WebServerLike
  workspaceRegistry: WorkspaceRegistryLike
  get(name: string): any
  effect(fn: () => void | (() => void), label?: string): void
  logger: { warn(message: string): void; error(error: unknown): void }
}

/** Wire envelope: every API method answers {ok:true,value} or {ok:false,error}. */
export type ApiOk<T> = { ok: true; value: T }
export type ApiErr = { ok: false; error: { code: string; message: string } }
export type ApiResult<T> = ApiOk<T> | ApiErr

/** One archived-chat list row. */
export interface ArchivedChatItem {
  sessionId: string
  /** Latest durable title, or null before the first title lands. */
  title: string | null
  /** Fallback display title (cwd basename → session id). */
  displayTitle: string
  createdAt: number
  cwd: string | null
  /** Whether the session's agent is genuinely RUNNING (an open, unfinished turn). */
  live: boolean
}

/** One transcript row for the viewer (mapped host-side; the client stays dumb). */
export interface TranscriptMessage {
  kind: 'user' | 'assistant' | 'tool'
  seq: number
  time: number
  text: string
  toolCalls?: Array<{ name: string; inputText: string }>
  toolName?: string
  /** tool-result rows: whether the call failed. */
  isError?: boolean
}

/** The /read response value. */
export interface TranscriptValue {
  sessionId: string
  title: string | null
  createdAt: number
  cwd: string | null
  messages: TranscriptMessage[]
  truncated: boolean
}

/** The /export response value (one downloadable text artifact). */
export interface ExportValue {
  filename: string
  contentType: string
  content: string
}
