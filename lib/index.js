// src/host/fence.ts
function header(headers, name2) {
  const value = headers[name2];
  return typeof value === "string" ? value : void 0;
}
function parseAuthority(authority) {
  try {
    return new URL(`http://${authority}`);
  } catch {
    return void 0;
  }
}
function isLoopbackHostname(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const parts = hostname.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
function canonicalAuthority(entry, entryUrl) {
  const port = entryUrl.port !== "" ? entryUrl.port : new URL(`https://${entry}`).port;
  return port === "" ? entryUrl.hostname : `${entryUrl.hostname}:${port}`;
}
function isTrustedAuthority(hostUrl, trustedHosts) {
  return trustedHosts.some((entry) => {
    const entryUrl = parseAuthority(entry);
    if (entryUrl === void 0) return false;
    return canonicalAuthority(entry, entryUrl) === entryUrl.hostname ? entryUrl.hostname === hostUrl.hostname : entryUrl.host === hostUrl.host;
  });
}
function isTrustedApiRequest(request, trustedHosts) {
  const host = header(request.headers, "host");
  if (host === void 0) return false;
  const hostUrl = parseAuthority(host);
  if (hostUrl === void 0) return false;
  if (!isLoopbackHostname(hostUrl.hostname) && !isTrustedAuthority(hostUrl, trustedHosts)) return false;
  if (header(request.headers, "sec-fetch-site") === "cross-site") return false;
  const origin = header(request.headers, "origin");
  if (origin === void 0) return true;
  try {
    return new URL(origin).host === hostUrl.host;
  } catch {
    return false;
  }
}

// src/host/api.ts
import { basename, dirname } from "node:path";
import { rm } from "node:fs/promises";
var ArchiveApiError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
var MAX_TRANSCRIPT_EVENTS = 400;
var MAX_TEXT_CHARS = 8e3;
var MAX_TOOL_INPUT_CHARS = 400;
function capText(value, max = MAX_TEXT_CHARS) {
  if (typeof value !== "string") return "";
  return value.length > max ? `${value.slice(0, max)}\u2026` : value;
}
function blockText(block) {
  if (block === null || typeof block !== "object") return "";
  const record = block;
  const type = record.type;
  if ((type === "text" || type === "markdown" || type === "reasoning" || type === "context") && typeof record.text === "string") {
    return record.text;
  }
  return "";
}
function contentText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map(blockText).filter((text) => text !== "").join("\n");
}
function toolCallsOf(content, callNames) {
  if (!Array.isArray(content)) return [];
  const calls = [];
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    const record = block;
    if (record.type !== "tool-call") continue;
    const name2 = typeof record.name === "string" ? record.name : "tool";
    if (typeof record.id === "string" && record.id !== "") callNames.set(record.id, name2);
    const argumentsRaw = typeof record.arguments === "string" ? record.arguments : "";
    calls.push({ name: name2, inputText: capText(argumentsRaw, MAX_TOOL_INPUT_CHARS) });
  }
  return calls;
}
function toolCallIdOf(data) {
  const content = data.content;
  if (!Array.isArray(content)) return void 0;
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    const record = block;
    if (record.type === "tool-result" && typeof record.toolCallId === "string") return record.toolCallId;
  }
  return void 0;
}
function toolResultIsError(data) {
  const content = data.content;
  if (!Array.isArray(content)) return false;
  for (const block of content) {
    if (block === null || typeof block !== "object") continue;
    const record = block;
    if (record.type === "tool-result" && record.isError === true) return true;
  }
  return false;
}
function toolResultText(data) {
  const content = data.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block === null || typeof block !== "object") continue;
      const record = block;
      if (record.type !== "tool-result") continue;
      if (typeof record.content === "string") return record.content;
      if (Array.isArray(record.content)) return contentText(record.content);
      if (record.content !== void 0) {
        try {
          return JSON.stringify(record.content);
        } catch {
          return "";
        }
      }
    }
    const text = contentText(content);
    if (text !== "") return text;
  }
  try {
    return JSON.stringify(content);
  } catch {
    return "";
  }
}
function transcriptMessageOf(event, callNames) {
  const data = event.data ?? {};
  if (event.type === "user/message") {
    return { kind: "user", seq: event.seq, time: event.time, text: contentText(data.content) };
  }
  if (event.type === "assistant/message") {
    const message = data.message ?? {};
    return {
      kind: "assistant",
      seq: event.seq,
      time: event.time,
      text: contentText(message.content),
      toolCalls: toolCallsOf(message.content, callNames)
    };
  }
  if (event.type === "tool/result") {
    const message = data.message ?? data;
    const callId = toolCallIdOf(message);
    const toolName = callId === void 0 ? void 0 : callNames.get(callId);
    return {
      kind: "tool",
      seq: event.seq,
      time: event.time,
      text: capText(toolResultText(message)),
      toolName,
      isError: toolResultIsError(message) || data.error !== void 0
    };
  }
  return void 0;
}
function collectToolCallNames(event, callNames) {
  if (event.type !== "tool/call") return;
  const data = event.data ?? {};
  if (typeof data.callId === "string" && typeof data.name === "string") {
    callNames.set(data.callId, data.name);
  }
}
function sessionHasOpenTurn(session) {
  const events = session.events;
  if (events === void 0 || events.length === 0) return false;
  for (let index = events.length - 1; index >= 0; index--) {
    const type = events[index].type;
    if (type === "turn/end" || type === "session/end-seed") return false;
    if (type === "turn/start") return true;
  }
  return false;
}
async function listArchived(ctx) {
  const archived = ctx.workspaceRegistry.archivedSessionIds.map((id) => String(id));
  const sessions = ctx.get("sessions");
  const persistence = ctx.get("sessionPersistence");
  const query = ctx.get("sessionQuery");
  const headers = /* @__PURE__ */ new Map();
  if (persistence !== void 0) {
    try {
      for (const header2 of await persistence.list()) headers.set(String(header2.id), header2);
    } catch (error) {
      ctx.logger.warn(`[dsh-session-manager] persistence list failed: ${String(error)}`);
    }
  }
  for (const id of archived) {
    const live = sessions?.get(id);
    if (live !== void 0) headers.set(id, live.header);
  }
  const items = [];
  for (const id of archived) {
    const header2 = headers.get(id);
    if (header2 === void 0) continue;
    let title = null;
    if (query !== void 0) {
      try {
        title = (await query.readTitle(id))?.title ?? null;
      } catch (error) {
        ctx.logger.warn(`[dsh-session-manager] title read failed for ${id}: ${String(error)}`);
      }
    }
    const running = sessions?.get(id) !== void 0 && sessionHasOpenTurn(sessions.get(id));
    const cwd = header2.cwd ?? null;
    const cwdBase = cwd === null ? "" : basename(cwd.replace(/[\\/]+$/, "")) || cwd;
    items.push({
      sessionId: id,
      title,
      displayTitle: title ?? (cwdBase !== "" ? cwdBase : id),
      createdAt: header2.createdAt,
      cwd,
      live: running
    });
  }
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}
async function readTranscript(ctx, sessionId) {
  const query = ctx.get("sessionQuery");
  if (query === void 0) {
    throw new ArchiveApiError("unavailable", "this deployment does not mount the session query service");
  }
  if (!ctx.workspaceRegistry.archivedSessionIds.some((id) => String(id) === sessionId)) {
    throw new ArchiveApiError("not-archived", "this session is not in the archive");
  }
  const surface = await query.readSurface(sessionId);
  const truncated = surface.events.length > MAX_TRANSCRIPT_EVENTS;
  const callNames = /* @__PURE__ */ new Map();
  for (const event of surface.events) collectToolCallNames(event, callNames);
  const rows = [];
  for (const event of surface.events.slice(-MAX_TRANSCRIPT_EVENTS)) {
    const message = transcriptMessageOf(event, callNames);
    if (message !== void 0) rows.push(message);
  }
  let title = null;
  try {
    title = (await query.readTitle(sessionId))?.title ?? null;
  } catch {
    title = null;
  }
  return {
    sessionId,
    title,
    createdAt: surface.session.createdAt,
    cwd: surface.session.cwd ?? null,
    messages: rows,
    truncated
  };
}
async function unarchiveSession(ctx, sessionId) {
  const registry = ctx.workspaceRegistry;
  const state = registry.requireState();
  if (!state.archivedSessionIds.some((id) => String(id) === sessionId)) return;
  await registry.setState({
    ...state,
    archivedSessionIds: state.archivedSessionIds.filter((id) => String(id) !== sessionId)
  });
}
async function restoreArchived(ctx, sessionId) {
  if (!ctx.workspaceRegistry.archivedSessionIds.some((id) => String(id) === sessionId)) {
    throw new ArchiveApiError("not-archived", "this session is not in the archive");
  }
  await unarchiveSession(ctx, sessionId);
  return listArchived(ctx);
}
async function exportSession(ctx, sessionId, format) {
  const query = ctx.get("sessionQuery");
  if (query === void 0) {
    throw new ArchiveApiError("unavailable", "this deployment does not mount the session query service");
  }
  if (!ctx.workspaceRegistry.archivedSessionIds.some((id) => String(id) === sessionId)) {
    throw new ArchiveApiError("not-archived", "this session is not in the archive");
  }
  let title = null;
  try {
    title = (await query.readTitle(sessionId))?.title ?? null;
  } catch {
    title = null;
  }
  if (format === "jsonl") {
    const log = await query.readSession(sessionId);
    const lines2 = [];
    for (const event of log.events) {
      try {
        lines2.push(JSON.stringify(event));
      } catch {
        lines2.push(JSON.stringify({ type: event.type, seq: event.seq, time: event.time, data: null }));
      }
    }
    return {
      filename: `${sessionId}.jsonl`,
      contentType: "application/x-ndjson",
      content: lines2.join("\n")
    };
  }
  const surface = await query.readSurface(sessionId);
  const callNames = /* @__PURE__ */ new Map();
  for (const event of surface.events) collectToolCallNames(event, callNames);
  const date = new Date(surface.session.createdAt);
  const pad = (value) => String(value).padStart(2, "0");
  const lines = [];
  lines.push(`# ${title ?? sessionId}`);
  lines.push("");
  lines.push(`- Session: \`${sessionId}\``);
  lines.push(`- Created: ${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`);
  if (surface.session.cwd !== void 0) lines.push(`- Cwd: \`${surface.session.cwd}\``);
  lines.push("");
  for (const event of surface.events) {
    const message = transcriptMessageOf(event, callNames);
    if (message === void 0) continue;
    if (message.kind === "user") {
      lines.push("## \u7528\u6237 / User");
      lines.push(message.text);
    } else if (message.kind === "assistant") {
      lines.push("## \u52A9\u624B / Assistant");
      if (message.text !== "") lines.push(message.text);
      for (const call of message.toolCalls ?? []) {
        lines.push(`> \u8C03\u7528\u5DE5\u5177 / tool: **${call.name}** ${call.inputText !== "" ? `\`${call.inputText}\`` : ""}`);
      }
    } else {
      lines.push(`## \u5DE5\u5177\u7ED3\u679C / Tool result${message.toolName !== void 0 ? ` \xB7 ${message.toolName}` : ""}${message.isError === true ? " (error)" : ""}`);
      lines.push(message.text === "" ? "_\uFF08\u65E0\u6587\u672C\u8F93\u51FA / no text output\uFF09_" : message.text);
    }
    lines.push("");
  }
  return {
    filename: `${title ?? sessionId}.md`,
    contentType: "text/markdown; charset=utf-8",
    content: lines.join("\n")
  };
}
async function detachIdleLiveSession(ctx, sessions, sessionId) {
  const store = sessions;
  try {
    const entry = store.store?.get(sessionId);
    if (entry === void 0 || store.detachEntered === void 0) return;
    if (entry?.id !== sessionId) return;
    store.detachEntered(entry);
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] failed to detach idle live session ${sessionId}: ${String(error)}`);
  }
}
async function deleteArchived(ctx, sessionId) {
  if (!ctx.workspaceRegistry.archivedSessionIds.some((id) => String(id) === sessionId)) {
    throw new ArchiveApiError("not-archived", "only archived chats can be permanently deleted");
  }
  const sessions = ctx.get("sessions");
  const live = sessions?.get(sessionId);
  if (live !== void 0) {
    if (sessionHasOpenTurn(live)) {
      throw new ArchiveApiError("session-active", "this session is currently running \u2014 wait for it to finish before deleting");
    }
    await detachIdleLiveSession(ctx, sessions, sessionId);
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  const persistence = ctx.get("sessionPersistence");
  if (persistence !== void 0) {
    const headers = await persistence.list();
    const meta = headers.find((header2) => String(header2.id) === sessionId);
    if (meta !== void 0) {
      const location = persistence.locate(meta);
      if (location === void 0) {
        throw new ArchiveApiError("unsupported-backend", "the active session backend exposes no per-session artifact to delete");
      }
      if (location.kind === "jsonl") {
        const dir = dirname(location.path);
        const dirName = basename(dir);
        const fileName = basename(location.path);
        if (!dirName.startsWith("session-") || !/^session\.jsonl(\.zstd)?$/.test(fileName)) {
          throw new ArchiveApiError("unsafe-path", "the resolved artifact path failed safety checks; refusing to delete");
        }
        await rm(dir, { recursive: true, force: true });
      } else {
        throw new ArchiveApiError("unsupported-backend", `deleting ${location.kind} artifacts is not supported`);
      }
    }
  }
  try {
    for (const workspace of ctx.workspaceRegistry.list()) {
      if (workspace.sessionIds.some((id) => String(id) === sessionId)) {
        await workspace.detachSession(sessionId);
      }
    }
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] workspace account cleanup failed for ${sessionId}: ${String(error)}`);
  }
  try {
    const cacheDomain = ctx.get("storageDomain")?.get("session_projcache");
    const cacheTable = cacheDomain?.table("sessions");
    if (cacheTable !== void 0) await cacheTable.delete(sessionId);
  } catch (error) {
    ctx.logger.warn(`[dsh-session-manager] projection cache cleanup failed for ${sessionId}: ${String(error)}`);
  }
  await unarchiveSession(ctx, sessionId);
  return listArchived(ctx);
}
async function callApi(ctx, method, payload) {
  try {
    if (method === "list") {
      return { ok: true, value: { items: await listArchived(ctx) } };
    }
    if (method === "read") {
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string" || sessionId === "") throw new ArchiveApiError("bad-request", "sessionId is required");
      return { ok: true, value: await readTranscript(ctx, sessionId) };
    }
    if (method === "restore") {
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string" || sessionId === "") throw new ArchiveApiError("bad-request", "sessionId is required");
      return { ok: true, value: { items: await restoreArchived(ctx, sessionId) } };
    }
    if (method === "export") {
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string" || sessionId === "") throw new ArchiveApiError("bad-request", "sessionId is required");
      const format = payload.format === "jsonl" ? "jsonl" : "markdown";
      return { ok: true, value: await exportSession(ctx, sessionId, format) };
    }
    if (method === "delete") {
      const sessionId = payload.sessionId;
      if (typeof sessionId !== "string" || sessionId === "") throw new ArchiveApiError("bad-request", "sessionId is required");
      return { ok: true, value: { items: await deleteArchived(ctx, sessionId) } };
    }
    throw new ArchiveApiError("not-found", `unknown session-manager API method "${method}"`);
  } catch (error) {
    if (error instanceof ArchiveApiError) {
      return { ok: false, error: { code: error.code, message: error.message } };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: { code: "internal", message } };
  }
}

// src/host/index.ts
var name = "dsh-session-admin";
var inject = ["webServer", "workspaceRegistry"];
var MAX_BODY_BYTES = 1 << 20;
async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    total += buffer.length;
    if (total > MAX_BODY_BYTES) {
      return {};
    }
    chunks.push(buffer);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (text.trim() === "") return {};
  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function writeJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(payload);
}
function apply(ctx) {
  const webRuntime = ctx.get("webRuntime");
  const trustedHosts = webRuntime?.trustedHosts ?? [];
  const fence = (req) => isTrustedApiRequest(req, trustedHosts);
  ctx.effect(() => ctx.webServer.register({
    kind: "prefix",
    path: "/session-manager/api",
    handler: async (req, res) => {
      if (!fence(req)) {
        writeJson(res, 403, { ok: false, error: { code: "forbidden", message: "forbidden" } });
        return;
      }
      if (req.method !== "POST") {
        writeJson(res, 405, { ok: false, error: { code: "method-error", message: "method not allowed" } });
        return;
      }
      const pathname = new URL(req.url ?? "/", "http://dsh.internal").pathname;
      const method = pathname.startsWith("/session-manager/api/") ? pathname.slice("/session-manager/api/".length) : void 0;
      if (method === void 0 || method === "" || method.includes("/")) {
        writeJson(res, 404, { ok: false, error: { code: "not-found", message: "unknown session-manager API method" } });
        return;
      }
      const payload = await readJsonBody(req);
      const result = await callApi(ctx, method, payload);
      writeJson(res, result.ok ? 200 : 400, result);
    }
  }), "dsh-session-manager: /session-manager/api routes");
}
export {
  apply,
  inject,
  name
};
