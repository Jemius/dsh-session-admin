window.__ModuleLoader__.load({
  id: "dsh-session-admin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var __DSM_CSS_TEXT__ = "/* src/client/styles.module.css */\n.styles_dsmSection {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-height: 240px;\n}\n.styles_dsmIntro {\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmToolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n.styles_dsmCount {\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmList {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.styles_dsmRow {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 10px 12px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  border-radius: 10px;\n  background: var(--dsw-alias-bg-layer-1);\n}\n.styles_dsmRowMain {\n  flex: 1 1 auto;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n.styles_dsmTitle {\n  font-size: 14px;\n  line-height: 20px;\n  font-weight: 500;\n  color: var(--dsw-alias-label-primary);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.styles_dsmMeta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 12px;\n  line-height: 16px;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmCwd {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 320px;\n}\n.styles_dsmLive {\n  padding: 0 8px;\n  border-radius: 999px;\n  font-size: 11px;\n  line-height: 18px;\n  color: var(--dsw-alias-state-warn-primary);\n  background: var(--dsw-alias-bg-layer-2);\n  white-space: nowrap;\n}\n.styles_dsmRowActions {\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  gap: 6px;\n}\n.styles_dsmEmpty {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  padding: 40px 16px;\n  text-align: center;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmEmptyTitle {\n  font-size: 14px;\n  color: var(--dsw-alias-label-primary);\n}\n.styles_dsmEmptyDesc {\n  font-size: 12px;\n  line-height: 18px;\n  max-width: 360px;\n}\n.styles_dsmStatus {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  padding: 32px 0;\n  font-size: 13px;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmError {\n  color: var(--dsw-alias-state-error-primary);\n}\n.styles_dsmViewerModal {\n  width: min(920px, 92vw);\n  height: min(80vh, 760px);\n  display: flex;\n  flex-direction: column;\n  overflow: hidden;\n}\n.styles_dsmViewerHead {\n  flex: 0 0 auto;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 14px 18px;\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n}\n.styles_dsmViewerTitle {\n  margin: 0;\n  font-size: 16px;\n  line-height: 24px;\n  font-weight: 600;\n  color: var(--dsw-alias-label-primary);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n.styles_dsmViewerClose {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  border: none;\n  border-radius: 999px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n.styles_dsmViewerClose:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-label-primary);\n}\n.styles_dsmViewerScroll {\n  flex: 1 1 auto;\n  min-height: 0;\n  overflow-y: auto;\n  padding: 14px 18px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n.styles_dsmViewerFooter {\n  flex: 0 0 auto;\n  padding: 12px 18px;\n  border-top: 1px solid var(--dsw-alias-border-l2);\n}\n.styles_dsmViewer {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  padding: 4px 2px;\n}\n.styles_dsmMsg {\n  max-width: 92%;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.styles_dsmMsgUser {\n  align-self: flex-end;\n  align-items: flex-end;\n}\n.styles_dsmMsgAssistant {\n  align-self: flex-start;\n  align-items: flex-start;\n}\n.styles_dsmMsgTool {\n  align-self: flex-start;\n  align-items: flex-start;\n  opacity: 0.92;\n}\n.styles_dsmBubble {\n  padding: 8px 12px;\n  border-radius: 12px;\n  font-size: 13px;\n  line-height: 20px;\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-bg-layer-2);\n  white-space: pre-wrap;\n  word-break: break-word;\n}\n.styles_dsmMsgUser .styles_dsmBubble {\n  background: var(--dsw-alias-brand-primary);\n  color: #ffffff;\n}\n.styles_dsmMsgTool .styles_dsmBubble {\n  font-size: 12px;\n  border: 1px solid var(--dsw-alias-border-l2);\n}\n.styles_dsmBubbleError {\n  border-color: var(--dsw-alias-state-error-primary);\n  color: var(--dsw-alias-state-error-primary);\n}\n.styles_dsmViewerActions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.styles_dsmRole {\n  font-size: 11px;\n  line-height: 16px;\n  color: var(--dsw-alias-label-secondary);\n}\n.styles_dsmToolCalls {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n}\n.styles_dsmToolCall {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  font-size: 12px;\n  line-height: 18px;\n  color: var(--dsw-alias-label-secondary);\n  padding: 4px 10px;\n  border-radius: 999px;\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-1);\n  max-width: 360px;\n}\n.styles_dsmToolCallName {\n  font-weight: 500;\n  color: var(--dsw-alias-label-primary);\n}\n.styles_dsmToolCallInput {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  max-width: 200px;\n}\n.styles_dsmViewerMeta {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  font-size: 12px;\n  color: var(--dsw-alias-label-secondary);\n  padding-bottom: 4px;\n  border-bottom: 1px solid var(--dsw-alias-border-l2);\n}\n.styles_dsmViewerNote {\n  font-size: 12px;\n  color: var(--dsw-alias-state-warn-primary);\n}\n.styles_dsmHeaderButton {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  border: none;\n  border-radius: 999px;\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n  cursor: pointer;\n}\n.styles_dsmHeaderButton:hover {\n  background: var(--dsw-alias-interactive-bg-hover);\n  color: var(--dsw-alias-state-error-primary);\n}\n.styles_dsmHeaderButton:focus-visible {\n  outline: 2px solid var(--dsw-alias-brand-primary);\n  outline-offset: 1px;\n}\n";
    (function () {
      if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css="dsh-session-admin/styles.module.css"]') === null) {
        var tag = document.createElement("style");
        tag.dataset.plugin = "dsh-session-admin";
        tag.dataset.pluginCss = "dsh-session-admin/styles.module.css";
        tag.textContent = __DSM_CSS_TEXT__;
        document.head.appendChild(tag);
      }
    })();
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/ui.tsx
var import_react = require("react");
var import_client = require("react-dom/client");
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");

// src/client/api.ts
var ArchiveApiError = class extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
};
async function call(method, payload, signal) {
  let response;
  try {
    response = await fetch(`/session-manager/api/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal
    });
  } catch (error) {
    throw new ArchiveApiError("network", error instanceof Error ? error.message : String(error));
  }
  const parsed = await response.json().catch(() => null);
  if (!response.ok || parsed === null || parsed.ok !== true || parsed.value === void 0) {
    throw new ArchiveApiError(
      parsed?.error?.code ?? "http",
      parsed?.error?.message ?? `HTTP ${response.status}`
    );
  }
  return parsed.value;
}
var api = {
  list: (signal) => call("list", {}, signal),
  read: (sessionId, signal) => call("read", { sessionId }, signal),
  restore: (sessionId, signal) => call("restore", { sessionId }, signal),
  export: (sessionId, format, signal) => call("export", { sessionId, format }, signal),
  delete: (sessionId, signal) => call("delete", { sessionId }, signal)
};
function downloadText(value) {
  const blob = new Blob([value.content], { type: value.contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = value.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e4);
}

// src/client/loc.ts
var zh = {
  // settings section
  nav: "\u5DF2\u5F52\u6863\u7684\u804A\u5929",
  intro: "\u67E5\u770B\u5DF2\u5220\u9664\uFF08\u5F52\u6863\uFF09\u7684\u4F1A\u8BDD\uFF0C\u6062\u590D\u67E5\u770B\u6216\u6C38\u4E45\u5220\u9664",
  empty: "\u6CA1\u6709\u5DF2\u5F52\u6863\u7684\u804A\u5929",
  emptyDesc: "\u5220\u9664\u4F1A\u8BDD\u65F6\uFF0C\u4F1A\u8BDD\u4F1A\u5148\u5F52\u6863\u5230\u8FD9\u91CC\uFF0C\u4E4B\u540E\u4ECD\u53EF\u67E5\u770B\u6216\u6C38\u4E45\u5220\u9664\u3002",
  refresh: "\u5237\u65B0",
  loading: "\u52A0\u8F7D\u4E2D\u2026",
  loadError: "\u52A0\u8F7D\u5931\u8D25",
  retry: "\u91CD\u8BD5",
  // rows
  running: "\u8FD0\u884C\u4E2D",
  view: "\u67E5\u770B",
  delete: "\u6C38\u4E45\u5220\u9664",
  deleted: "\u5DF2\u6C38\u4E45\u5220\u9664",
  // viewer
  viewerTitle: "\u4F1A\u8BDD\u8BB0\u5F55",
  viewerTruncated: "\u5185\u5BB9\u8F83\u957F\uFF0C\u4EC5\u663E\u793A\u6700\u8FD1\u7684 {n} \u6761\u6D88\u606F",
  toolCall: "\u8C03\u7528\u5DE5\u5177",
  toolResult: "\u5DE5\u5177\u7ED3\u679C",
  toolError: "\u5931\u8D25",
  close: "\u5173\u95ED",
  restore: "\u6062\u590D",
  restoreConfirmTitle: "\u6062\u590D\u4F1A\u8BDD",
  restoreConfirmDesc: "\u5C06\u628A\u300C{name}\u300D\u6062\u590D\u5230\u539F\u5DE5\u4F5C\u533A\u4F4D\u7F6E\uFF0C\u4ECE\u5DF2\u5F52\u6863\u5217\u8868\u4E2D\u79FB\u51FA\u3002",
  restoredToast: "\u4F1A\u8BDD\u5DF2\u6062\u590D",
  restoreFailed: "\u6062\u590D\u5931\u8D25",
  export: "\u5BFC\u51FA",
  exportMarkdown: "\u5BFC\u51FA\u4E3A Markdown",
  exportJsonl: "\u5BFC\u51FA\u4E3A JSONL",
  exportFailed: "\u5BFC\u51FA\u5931\u8D25",
  // delete confirm
  deleteTitle: "\u6C38\u4E45\u5220\u9664\u4F1A\u8BDD",
  deleteDesc: "\u5C06\u6C38\u4E45\u5220\u9664\u300C{name}\u300D\u7684\u5168\u90E8\u8BB0\u5F55\uFF0C\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002",
  deleteConfirm: "\u786E\u8BA4\u5220\u9664",
  cancel: "\u53D6\u6D88",
  deleteFailed: "\u5220\u9664\u5931\u8D25",
  // header delete action
  headerDelete: "\u5220\u9664\u4F1A\u8BDD",
  headerDeleteConfirmTitle: "\u5220\u9664\u4F1A\u8BDD",
  headerDeleteConfirmDesc: "\u5C06\u5220\u9664\u300C{name}\u300D\uFF0C\u4F1A\u8BDD\u4F1A\u79FB\u5165 \u8BBE\u7F6E \u2192 \u5DF2\u5F52\u6863\u7684\u804A\u5929\uFF0C\u53EF\u968F\u65F6\u67E5\u770B\u3002",
  headerDeleteConfirm: "\u5220\u9664",
  archivedToast: "\u4F1A\u8BDD\u5DF2\u5220\u9664\uFF0C\u53EF\u5728 \u8BBE\u7F6E \u2192 \u5DF2\u5F52\u6863\u7684\u804A\u5929 \u4E2D\u67E5\u770B",
  archiveFailed: "\u5220\u9664\u5931\u8D25",
  // time
  timeJustNow: "\u521A\u521A",
  timeMinutesAgo: "{n} \u5206\u949F\u524D",
  timeHoursAgo: "{n} \u5C0F\u65F6\u524D",
  timeYesterday: "\u6628\u5929"
};
var en = {
  nav: "Archived chats",
  intro: "View deleted (archived) chats \u2014 read their transcripts or delete them permanently",
  empty: "No archived chats",
  emptyDesc: "When you delete a chat it is archived here first; you can still view or permanently delete it.",
  refresh: "Refresh",
  loading: "Loading\u2026",
  loadError: "Failed to load",
  retry: "Retry",
  running: "Running",
  view: "View",
  delete: "Delete permanently",
  deleted: "Deleted permanently",
  viewerTitle: "Transcript",
  viewerTruncated: "Long transcript \u2014 showing the latest {n} messages only",
  toolCall: "Call tool",
  toolResult: "Tool result",
  toolError: "error",
  close: "Close",
  restore: "Restore",
  restoreConfirmTitle: "Restore chat",
  restoreConfirmDesc: 'Move "{name}" back to its original workspace position and out of the archive.',
  restoredToast: "Chat restored",
  restoreFailed: "Restore failed",
  export: "Export",
  exportMarkdown: "Export as Markdown",
  exportJsonl: "Export as JSONL",
  exportFailed: "Export failed",
  deleteTitle: "Delete chat permanently",
  deleteDesc: 'This permanently deletes every record of "{name}" and cannot be undone.',
  deleteConfirm: "Delete",
  cancel: "Cancel",
  deleteFailed: "Delete failed",
  headerDelete: "Delete chat",
  headerDeleteConfirmTitle: "Delete chat",
  headerDeleteConfirmDesc: 'Delete "{name}"? It moves to Settings \u2192 Archived chats, where you can view it anytime.',
  headerDeleteConfirm: "Delete",
  archivedToast: "Chat deleted \u2014 find it under Settings \u2192 Archived chats",
  archiveFailed: "Delete failed",
  timeJustNow: "just now",
  timeMinutesAgo: "{n} min ago",
  timeHoursAgo: "{n} h ago",
  timeYesterday: "yesterday"
};
var LOCALE_NS = "sessionManager";
var localeService;
function attachLocale(service) {
  localeService = service;
}
function activeLocale() {
  return localeService?.getSnapshot().active ?? (typeof navigator !== "undefined" ? navigator.language : "") ?? "en";
}
function t(key, params) {
  const dict = activeLocale().toLowerCase().startsWith("zh") ? zh : en;
  let text = dict[key];
  if (params !== void 0) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}
function relativeTime(epochMs) {
  const then = new Date(epochMs);
  if (Number.isNaN(then.getTime())) return "";
  const seconds = Math.floor((Date.now() - then.getTime()) / 1e3);
  if (seconds < 60) return t("timeJustNow");
  if (seconds < 3600) return t("timeMinutesAgo", { n: Math.floor(seconds / 60) });
  if (seconds < 86400) return t("timeHoursAgo", { n: Math.floor(seconds / 3600) });
  if (seconds < 172800) return t("timeYesterday");
  const pad = (value) => String(value).padStart(2, "0");
  return `${then.getFullYear()}-${pad(then.getMonth() + 1)}-${pad(then.getDate())}`;
}

// src/client/styles.module.css
var styles_default = {
  dsmSection: "styles_dsmSection",
  dsmIntro: "styles_dsmIntro",
  dsmToolbar: "styles_dsmToolbar",
  dsmCount: "styles_dsmCount",
  dsmList: "styles_dsmList",
  dsmRow: "styles_dsmRow",
  dsmRowMain: "styles_dsmRowMain",
  dsmTitle: "styles_dsmTitle",
  dsmMeta: "styles_dsmMeta",
  dsmCwd: "styles_dsmCwd",
  dsmLive: "styles_dsmLive",
  dsmRowActions: "styles_dsmRowActions",
  dsmEmpty: "styles_dsmEmpty",
  dsmEmptyTitle: "styles_dsmEmptyTitle",
  dsmEmptyDesc: "styles_dsmEmptyDesc",
  dsmStatus: "styles_dsmStatus",
  dsmError: "styles_dsmError",
  dsmViewerModal: "styles_dsmViewerModal",
  dsmViewerHead: "styles_dsmViewerHead",
  dsmViewerTitle: "styles_dsmViewerTitle",
  dsmViewerClose: "styles_dsmViewerClose",
  dsmViewerScroll: "styles_dsmViewerScroll",
  dsmViewerFooter: "styles_dsmViewerFooter",
  dsmViewer: "styles_dsmViewer",
  dsmMsg: "styles_dsmMsg",
  dsmMsgUser: "styles_dsmMsgUser",
  dsmMsgAssistant: "styles_dsmMsgAssistant",
  dsmMsgTool: "styles_dsmMsgTool",
  dsmBubble: "styles_dsmBubble",
  dsmBubbleError: "styles_dsmBubbleError",
  dsmViewerActions: "styles_dsmViewerActions",
  dsmRole: "styles_dsmRole",
  dsmToolCalls: "styles_dsmToolCalls",
  dsmToolCall: "styles_dsmToolCall",
  dsmToolCallName: "styles_dsmToolCallName",
  dsmToolCallInput: "styles_dsmToolCallInput",
  dsmViewerMeta: "styles_dsmViewerMeta",
  dsmViewerNote: "styles_dsmViewerNote",
  dsmHeaderButton: "styles_dsmHeaderButton"
};

// src/client/ui.tsx
var import_jsx_runtime = require("react/jsx-runtime");
function describeError(error) {
  if (error instanceof ArchiveApiError) {
    if (error.code === "session-active") return isZhCopy() ? "\u8BE5\u4F1A\u8BDD\u6B63\u5728\u8FD0\u884C\u4E2D\uFF0C\u8BF7\u7B49\u5F85\u5176\u5B8C\u6210\u540E\u518D\u8BD5" : "This chat is currently running \u2014 try again after it finishes";
    if (error.code === "not-archived") return isZhCopy() ? "\u8BE5\u4F1A\u8BDD\u4E0D\u5728\u5F52\u6863\u5217\u8868\u4E2D" : "This chat is not in the archive";
    if (error.code === "not-found") return isZhCopy() ? "\u63A5\u53E3\u4E0D\u5B58\u5728" : "Unknown API method";
    if (error.code === "forbidden") return isZhCopy() ? "\u8BF7\u6C42\u88AB\u62D2\u7EDD" : "Request refused";
    if (error.code === "network") return isZhCopy() ? "\u7F51\u7EDC\u9519\u8BEF" : "Network error";
    if (error.code === "unsupported-backend" || error.code === "unsafe-path" || error.code === "unavailable") return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}
function isZhCopy() {
  return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("zh");
}
function showToast(text) {
  if (typeof document === "undefined") return;
  const host = document.createElement("div");
  host.setAttribute("data-dsm-toast", "");
  document.body.appendChild(host);
  const root = (0, import_client.createRoot)(host);
  const cleanup = () => {
    try {
      root.unmount();
    } catch {
    }
    host.remove();
  };
  root.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Toast, { text, onDone: cleanup }));
}
function timeLabel(epochMs) {
  return relativeTime(epochMs);
}
function TranscriptModal(props) {
  const [value, setValue] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    let cancelled = false;
    setValue(null);
    setError(null);
    api.read(props.sessionId).then(
      (result) => {
        if (!cancelled) setValue(result);
      },
      (reason) => {
        if (!cancelled) setError(describeError(reason));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [props.sessionId]);
  const doRestore = () => {
    if (busy) return;
    setBusy(true);
    api.restore(props.sessionId).then(
      () => {
        setBusy(false);
        props.onRestored();
      },
      (reason) => {
        setBusy(false);
        showToast(`${t("restoreFailed")}: ${describeError(reason)}`);
      }
    );
  };
  const doExport = (format) => {
    if (busy) return;
    setBusy(true);
    api.export(props.sessionId, format).then(
      (result) => {
        setBusy(false);
        downloadText(result);
        showToast(`${t("export")} \xB7 ${result.filename}`);
      },
      (reason) => {
        setBusy(false);
        showToast(`${t("exportFailed")}: ${describeError(reason)}`);
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    import_dsh_client_ui_primitives.Modal,
    {
      open: true,
      onClose: props.onClose,
      title: `${t("viewerTitle")} \xB7 ${props.title}`,
      closeLabel: t("close"),
      headless: true,
      className: styles_default.dsmViewerModal,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmViewerHead, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: styles_default.dsmViewerTitle, children: `${t("viewerTitle")} \xB7 ${props.title}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.dsmViewerClose, "aria-label": t("close"), onClick: props.onClose, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconCloseOutline16, { size: 14 }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmViewerScroll, children: [
          error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmError, children: error }),
          value === null && error === null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmStatus, children: t("loading") }),
          value !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmViewerMeta, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeLabel(value.createdAt) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                value.messages.length,
                " ",
                isZhCopy() ? "\u6761\u6D88\u606F" : "messages"
              ] })
            ] }),
            value.truncated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmViewerNote, children: t("viewerTruncated", { n: value.messages.length }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmViewer, children: value.messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `${styles_default.dsmMsg} ${message.kind === "user" ? styles_default.dsmMsgUser : message.kind === "assistant" ? styles_default.dsmMsgAssistant : styles_default.dsmMsgTool}`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmRole, children: message.kind === "user" ? isZhCopy() ? "\u7528\u6237" : "User" : message.kind === "assistant" ? isZhCopy() ? "\u52A9\u624B" : "Assistant" : `${t("toolResult")}${message.toolName !== void 0 ? ` \xB7 ${message.toolName}` : ""}${message.isError === true ? ` \xB7 ${t("toolError")}` : ""}` }),
              message.toolCalls !== void 0 && message.toolCalls.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmToolCalls, children: message.toolCalls.map((call2, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_default.dsmToolCall, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("toolCall") }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmToolCallName, children: call2.name }),
                call2.inputText !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmToolCallInput, children: call2.inputText })
              ] }, index)) }),
              message.text !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `${styles_default.dsmBubble}${message.isError === true ? ` ${styles_default.dsmBubbleError}` : ""}`, children: message.text })
            ] }, message.seq)) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmViewerFooter, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmViewerActions, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", disabled: busy, onClick: doRestore, children: t("restore") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", disabled: busy, onClick: () => {
            doExport("markdown");
          }, children: t("exportMarkdown") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", disabled: busy, onClick: () => {
            doExport("jsonl");
          }, children: t("exportJsonl") })
        ] }) })
      ]
    }
  );
}
function ArchivedSection(props) {
  const [items, setItems] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [viewing, setViewing] = (0, import_react.useState)(null);
  const [deleting, setDeleting] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const load = () => {
    setError(null);
    api.list().then(
      (result) => {
        setItems(result.items);
      },
      (reason) => {
        setError(describeError(reason));
        setItems((items2) => items2 ?? []);
      }
    );
  };
  (0, import_react.useEffect)(load, []);
  const confirmDelete = () => {
    if (deleting === null) return;
    setBusy(true);
    api.delete(deleting.sessionId).then(
      (result) => {
        setItems(result.items);
        setDeleting(null);
        setBusy(false);
        showToast(t("deleted"));
      },
      (reason) => {
        setDeleting(null);
        setBusy(false);
        showToast(`${t("deleteFailed")}: ${describeError(reason)}`);
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmSection, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.dsmIntro, children: t("intro") }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmToolbar, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmCount, children: items === null ? "" : isZhCopy() ? `${items.length} \u4E2A\u4F1A\u8BDD` : `${items.length} chats` }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconRefreshOutline16, { size: 14 }), onClick: load, children: t("refresh") })
    ] }),
    items === null && error === null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmStatus, children: t("loading") }),
    items !== null && error !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmStatus, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmError, children: error }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", onClick: load, children: t("retry") })
    ] }),
    items !== null && items.length === 0 && error === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmEmpty, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconNewChatOutline16, { size: 28 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmEmptyTitle, children: t("empty") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmEmptyDesc, children: t("emptyDesc") })
    ] }),
    items !== null && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.dsmList, children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmRow, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmRowMain, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmTitle, children: item.displayTitle }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: styles_default.dsmMeta, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: timeLabel(item.createdAt) }),
          item.cwd !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmCwd, title: item.cwd, children: item.cwd }),
          item.live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.dsmLive, children: t("running") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dsmRowActions, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "outline", size: "sm", onClick: () => {
          setViewing({ sessionId: item.sessionId, title: item.displayTitle });
        }, children: t("view") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", size: "sm", icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 }), onClick: () => {
          setDeleting(item);
        }, children: t("delete") })
      ] })
    ] }, item.sessionId)) }),
    viewing !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      TranscriptModal,
      {
        sessionId: viewing.sessionId,
        title: viewing.title,
        onClose: () => {
          setViewing(null);
        },
        onRestored: () => {
          setViewing(null);
          load();
          showToast(t("restoredToast"));
        }
      }
    ),
    deleting !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Modal,
      {
        open: true,
        onClose: () => {
          if (!busy) setDeleting(null);
        },
        title: t("deleteTitle"),
        closeLabel: t("close"),
        description: t("deleteDesc", { name: deleting.displayTitle }),
        footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", disabled: busy, onClick: () => {
            setDeleting(null);
          }, children: t("cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "primary", disabled: busy, onClick: confirmDelete, children: busy ? t("loading") : t("deleteConfirm") })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
      }
    )
  ] });
}
function HeaderDeleteAction(props) {
  const [confirming, setConfirming] = (0, import_react.useState)(false);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const title = props.useSessions((state) => state.byId[props.sessionId]?.displayTitle ?? props.sessionId);
  const doArchive = () => {
    setBusy(true);
    workspacesRef.archiveSession(props.sessionId).then(
      () => {
        setBusy(false);
        setConfirming(false);
        showToast(t("archivedToast"));
      },
      (reason) => {
        setBusy(false);
        setConfirming(false);
        showToast(`${t("archiveFailed")}: ${describeError(reason)}`);
      }
    );
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        className: styles_default.dsmHeaderButton,
        "aria-label": t("headerDelete"),
        title: t("headerDelete"),
        onClick: () => {
          setConfirming(true);
        },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.IconTrashOutline16, { size: 16 })
      }
    ),
    confirming && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_dsh_client_ui_primitives.Modal,
      {
        open: true,
        onClose: () => {
          if (!busy) setConfirming(false);
        },
        title: t("headerDeleteConfirmTitle"),
        closeLabel: t("close"),
        description: t("headerDeleteConfirmDesc", { name: title }),
        footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "ghost", disabled: busy, onClick: () => {
            setConfirming(false);
          }, children: t("cancel") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_dsh_client_ui_primitives.Button, { variant: "primary", disabled: busy, onClick: doArchive, children: busy ? t("loading") : t("headerDeleteConfirm") })
        ] }),
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {})
      }
    )
  ] });
}
var workspacesRef;
function bindWorkspaces(workspaces) {
  workspacesRef = workspaces;
}

// src/client/index.tsx
var CSS_TAG_ID = "dsh-session-admin/styles.module.css";
function injectStyles(cssText) {
  if (typeof document === "undefined") return;
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(CSS_TAG_ID)}]`) !== null) return;
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-session-admin";
  tag.dataset.pluginCss = CSS_TAG_ID;
  tag.textContent = cssText;
  document.head.appendChild(tag);
}
var inject = ["slots", "workspaces", "locale"];
function apply(ctx) {
  injectStyles(__DSM_CSS_TEXT__);
  attachLocale(ctx.locale);
  bindWorkspaces(ctx.workspaces);
  ctx.effect(() => {
    const offZh = ctx.locale.register(LOCALE_NS, "zh", zh);
    const offEn = ctx.locale.register(LOCALE_NS, "en", en);
    return () => {
      offZh();
      offEn();
    };
  }, "dsh-session-manager: dictionaries");
  ctx.slots.inject("settings.section", () => ctx.slots.register({
    name: "settings.section",
    id: "session-archive",
    order: 110,
    label: () => t("nav"),
    registrant: "dsh-session-manager",
    inject: () => ({})
  }, ArchivedSection));
  ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
    name: "conversation.session.header.actions",
    id: "session-manager-delete",
    order: 50,
    registrant: "dsh-session-manager",
    inject: () => ({})
  }, HeaderDeleteAction));
}

    return module.exports;
  }
});
