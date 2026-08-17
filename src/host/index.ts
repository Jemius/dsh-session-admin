/**
 * Host half of dsh-session-admin: mounts the fenced
 * /session-manager/api JSON routes (list / read / delete) and registers the
 * optional sessionQuery-based archive persistence hook. The row is inserted
 * after every stock web row, so webServer and workspaceRegistry exist when
 * this plugin activates; sessions/sessionQuery/sessionPersistence are read
 * tolerantly through ctx.get so headless compositions without them degrade
 * to 4xx answers instead of boot failures.
 *
 * No stock rows are restated and no other plugin's service is replaced:
 * the archive set is read from ctx.workspaceRegistry (the SAME state the
 * stock workspace browser writes through its Archive action), so this
 * plugin and the stock UI stay consistent by construction.
 */
import { isTrustedApiRequest } from './fence.ts'
import { callApi } from './api.ts'
import type { HostContext, HttpRequestLike, HttpResponseLike } from './types.ts'

export const name = 'dsh-session-admin'

/** Host services required at activation (both exist in the web composition). */
export const inject = ['webServer', 'workspaceRegistry']

/** Maximum JSON request body size (defense against unbounded reads). */
const MAX_BODY_BYTES = 1 << 20

/** Read and parse a bounded JSON request body (malformed → bad-request). */
async function readJsonBody(req: HttpRequestLike): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk)
    total += buffer.length
    if (total > MAX_BODY_BYTES) {
      return {}
    }
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  if (text.trim() === '') return {}
  try {
    const parsed = JSON.parse(text) as unknown
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

/** Write the JSON envelope with the given status. */
function writeJson(res: HttpResponseLike, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(payload)
}

/**
 * Plugin body: mount the fenced API routes (disposed with the fiber).
 * @param ctx - host plugin context (webServer, workspaceRegistry + optional reads).
 */
export function apply(ctx: HostContext): void {
  const webRuntime = ctx.get('webRuntime') as { trustedHosts: readonly string[] } | undefined
  const trustedHosts = webRuntime?.trustedHosts ?? []
  const fence = (req: HttpRequestLike): boolean => isTrustedApiRequest(req, trustedHosts)

  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/session-manager/api',
    handler: async (req, res) => {
      if (!fence(req)) {
        writeJson(res, 403, { ok: false, error: { code: 'forbidden', message: 'forbidden' } })
        return
      }
      if (req.method !== 'POST') {
        writeJson(res, 405, { ok: false, error: { code: 'method-error', message: 'method not allowed' } })
        return
      }
      const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname
      const method = pathname.startsWith('/session-manager/api/') ? pathname.slice('/session-manager/api/'.length) : undefined
      if (method === undefined || method === '' || method.includes('/')) {
        writeJson(res, 404, { ok: false, error: { code: 'not-found', message: 'unknown session-manager API method' } })
        return
      }
      const payload = await readJsonBody(req)
      const result = await callApi(ctx, method, payload)
      writeJson(res, result.ok ? 200 : 400, result)
    },
  }), 'dsh-session-admin: /session-manager/api routes')
}
