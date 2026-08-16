/**
 * Typed fetch wrapper over the /session-manager JSON API. Every call posts
 * to `/session-manager/api/<method>` and surfaces failures as
 * {@link ArchiveApiError} with the wire code (mirror of the host envelope).
 */

/** One wire failure. */
export class ArchiveApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message)
  }
}

/** One archived-chat list row. */
export interface ArchivedChatItem {
  sessionId: string
  title: string | null
  displayTitle: string
  createdAt: number
  cwd: string | null
  live: boolean
}

/** One viewer transcript row. */
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

async function call<T>(method: string, payload: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/session-manager/api/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    throw new ArchiveApiError('network', error instanceof Error ? error.message : String(error))
  }
  const parsed: { ok?: boolean; value?: unknown; error?: { code?: string; message?: string } } | null
    = await response.json().catch(() => null)
  if (!response.ok || parsed === null || parsed.ok !== true || parsed.value === undefined) {
    throw new ArchiveApiError(
      parsed?.error?.code ?? 'http',
      parsed?.error?.message ?? `HTTP ${response.status}`,
    )
  }
  return parsed.value as T
}

/** The client API surface. */
export const api = {
  list: (signal?: AbortSignal) =>
    call<{ items: ArchivedChatItem[] }>('list', {}, signal),
  read: (sessionId: string, signal?: AbortSignal) =>
    call<TranscriptValue>('read', { sessionId }, signal),
  restore: (sessionId: string, signal?: AbortSignal) =>
    call<{ items: ArchivedChatItem[] }>('restore', { sessionId }, signal),
  export: (sessionId: string, format: 'markdown' | 'jsonl', signal?: AbortSignal) =>
    call<ExportValue>('export', { sessionId, format }, signal),
  delete: (sessionId: string, signal?: AbortSignal) =>
    call<{ items: ArchivedChatItem[] }>('delete', { sessionId }, signal),
}

/** Trigger a browser download of a text artifact returned by the export API. */
export function downloadText(value: ExportValue): void {
  const blob = new Blob([value.content], { type: value.contentType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = value.filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
