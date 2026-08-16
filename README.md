# dsh-session-admin

DSH 网页插件：会话管理。为会话增加**删除**入口，并在设置中提供**已归档的聊天**管理页，可查看 / 恢复 / 导出 / 永久删除。

A DSH web plugin for session management: a **Delete** action for sessions plus an **Archived chats** manager in Settings (view, restore, export, or permanently delete).

## 功能 / Features

1. **删除会话** — 会话标题栏出现一个删除按钮；确认后会话被删除（移入归档，记录保留）。删除由 DSH 运行时原生的归档通道执行（`workspace.archiveSession`），与其他插件及官方「归档会话」菜单共用同一份状态，天然不会冲突。
2. **设置 → 已归档的聊天** — 新设置页列出所有已归档会话（标题、时间、工作目录、运行状态），支持：
   - **查看**：弹窗阅读完整会话记录——用户/助手消息、工具调用（含参数）、工具结果（含失败标记），工具名通过日志中的 `tool/call` 事件与 `tool/result` 关联。
   - **恢复**：把会话移出归档，回到原工作区位置（走 workspace 存储域的原生状态写入，多标签页实时同步）。
   - **导出**：`导出为 Markdown`（人类可读转写）或 `导出为 JSONL`（完整原始事件日志，每行一个事件）。
   - **永久删除**：确认后移除持久化日志（文件级删除，不可撤销），并清理工作区账目、投影缓存与归档集合引用。
   - 只有**正在运行**（agent 执行中，存在未闭合的 turn）的会话会被拒绝；空闲会话——包括本次运行中打开过、仍在内存里的——都可直接删除/恢复（删除时会先从内存摘下，防止残留对象把文件写回）；「运行中」标记同样以 open-turn 判断，已停止的会话不会误报。

1. **Delete chat** — a trash button in the conversation header; confirming deletes (archives) the chat. The delete rides the runtime's own archive channel (`workspace.archiveSession`), sharing one state with the stock "Archive session" menu and every other plugin — no conflicts by construction.
2. **Settings → Archived chats** — lists every archived chat (title, time, workspace, running status):
   - **View**: read the full transcript in a modal — user/assistant messages, tool calls (with arguments), and tool results (with error flags); tool names are correlated through the log's `tool/call` → `tool/result` pairing.
   - **Restore**: moves the chat out of the archive back to its original workspace position (through the workspace storage domain's native state write; all tabs sync live).
   - **Export**: as **Markdown** (readable transcript) or **JSONL** (the complete raw event log, one event per line).
   - **Delete permanently**: removes the persisted log (irreversible) and prunes the workspace account, projection cache, and archive-set references.
   - Only a session whose agent is actually RUNNING (an open, unfinished turn) refuses deletion; idle sessions — including ones opened earlier this process and still in memory — delete and restore cleanly (the leftover in-memory object is retired first so it cannot write the file back). The "Running" badge uses the same open-turn test, so stopped chats never show it falsely.

## 安装 / Install

```sh
dsh plugin --profile web add dsh-session-admin
```

The package's `dsh.bundle.patch` appends the plugin row to the profile bundle stack; the row is strictly additive (it restates no stock row), so it cannot conflict with other plugins or future upgrades.

## 架构 / Architecture

- **Host half** (`lib/index.js`): mounts fenced `/session-manager/api/{list,read,restore,export,delete}` routes (loopback/trusted-host fence, same policy as the stock `/api` gateway and dsh-better-sidebar). Reads the archive set from `ctx.workspaceRegistry`, titles and surfaces from `ctx.sessionQuery`, and artifacts from `ctx.sessionPersistence`. Deletion removes the session-owned artifact directory (the documented out-of-band maintenance path — the seam has no deletion API), then prunes the workspace accounts, the projection-cache row, and finally the archive-set id; the JSONL backend rediscovers the layout on the next list and the FTS index reconciles itself.
- **Client half** (`lib/client.js`): registers the `settings.section` page and the `conversation.session.header.actions` button through the slot system (`ctx.slots.inject` waits for the declaring shells). No DOM interception, no service replacement, no stock-row patches. All styles are CSS-module scoped and ride the shared `--dsw-*` theme tokens; copy follows the DSH locale registry (zh/en).

## 构建 / Build

```sh
pnpm install   # or npm install (esbuild only)
npm run build  # emits lib/index.js + lib/client.js
```

## 自测 / Acceptance test

仓库外随插件提供 `test-ui.mjs`，用 puppeteer-core + 系统 Chromium 驱动真实浏览器做端到端验收：删除按钮、归档、设置页归档列表、转写查看（含工具调用）、导出、恢复、永久删除、磁盘清理，以及与官方会话菜单和 `dsh-better-sidebar` 的共存。运行方式：

```sh
# 1. 用隔离的 DSH_HOME 启动测试实例（共享真实 profiles，隔离数据）：
#    $env:DSH_HOME=<temp-home>，把真实 profiles 目录 junction 到 <temp-home>/profiles
#    $env:DSH_HOME=...; dsh web --port 3099
# 2. node test-ui.mjs
```
