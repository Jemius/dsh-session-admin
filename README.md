# dsh-session-admin

DSH 缃戦〉鎻掍欢锛氫細璇濈鐞嗐€備负浼氳瘽澧炲姞**鍒犻櫎**鍏ュ彛锛屽苟鍦ㄨ缃腑鎻愪緵**宸插綊妗ｇ殑鑱婂ぉ**绠＄悊椤碉紝鍙煡鐪?/ 鎭㈠ / 瀵煎嚭 / 姘镐箙鍒犻櫎銆?
A DSH web plugin for session management: a **Delete** action for sessions plus an **Archived chats** manager in Settings (view, restore, export, or permanently delete).

## 鍔熻兘 / Features

1. **鍒犻櫎浼氳瘽** 鈥?浼氳瘽鏍囬鏍忓嚭鐜颁竴涓垹闄ゆ寜閽紱纭鍚庝細璇濊鍒犻櫎锛堢Щ鍏ュ綊妗ｏ紝璁板綍淇濈暀锛夈€傚垹闄ょ敱 DSH 杩愯鏃跺師鐢熺殑褰掓。閫氶亾鎵ц锛坄workspace.archiveSession`锛夛紝涓庡叾浠栨彃浠跺強瀹樻柟銆屽綊妗ｄ細璇濄€嶈彍鍗曞叡鐢ㄥ悓涓€浠界姸鎬侊紝澶╃劧涓嶄細鍐茬獊銆?2. **璁剧疆 鈫?宸插綊妗ｇ殑鑱婂ぉ** 鈥?鏂拌缃〉鍒楀嚭鎵€鏈夊凡褰掓。浼氳瘽锛堟爣棰樸€佹椂闂淬€佸伐浣滅洰褰曘€佽繍琛岀姸鎬侊級锛屾敮鎸侊細
   - **鏌ョ湅**锛氬脊绐楅槄璇诲畬鏁翠細璇濊褰曗€斺€旂敤鎴?鍔╂墜娑堟伅銆佸伐鍏疯皟鐢紙鍚弬鏁帮級銆佸伐鍏风粨鏋滐紙鍚け璐ユ爣璁帮級锛屽伐鍏峰悕閫氳繃鏃ュ織涓殑 `tool/call` 浜嬩欢涓?`tool/result` 鍏宠仈銆?   - **鎭㈠**锛氭妸浼氳瘽绉诲嚭褰掓。锛屽洖鍒板師宸ヤ綔鍖轰綅缃紙璧?workspace 瀛樺偍鍩熺殑鍘熺敓鐘舵€佸啓鍏ワ紝澶氭爣绛鹃〉瀹炴椂鍚屾锛夈€?   - **瀵煎嚭**锛歚瀵煎嚭涓?Markdown`锛堜汉绫诲彲璇昏浆鍐欙級鎴?`瀵煎嚭涓?JSONL`锛堝畬鏁村師濮嬩簨浠舵棩蹇楋紝姣忚涓€涓簨浠讹級銆?   - **姘镐箙鍒犻櫎**锛氱‘璁ゅ悗绉婚櫎鎸佷箙鍖栨棩蹇楋紙鏂囦欢绾у垹闄わ紝涓嶅彲鎾ら攢锛夛紝骞舵竻鐞嗗伐浣滃尯璐︾洰銆佹姇褰辩紦瀛樹笌褰掓。闆嗗悎寮曠敤銆?   - 鍙湁**姝ｅ湪杩愯**锛坅gent 鎵ц涓紝瀛樺湪鏈棴鍚堢殑 turn锛夌殑浼氳瘽浼氳鎷掔粷锛涚┖闂蹭細璇濃€斺€斿寘鎷湰娆¤繍琛屼腑鎵撳紑杩囥€佷粛鍦ㄥ唴瀛橀噷鐨勨€斺€旈兘鍙洿鎺ュ垹闄?鎭㈠锛堝垹闄ゆ椂浼氬厛浠庡唴瀛樻憳涓嬶紝闃叉娈嬬暀瀵硅薄鎶婃枃浠跺啓鍥烇級锛涖€岃繍琛屼腑銆嶆爣璁板悓鏍蜂互 open-turn 鍒ゆ柇锛屽凡鍋滄鐨勪細璇濅笉浼氳鎶ャ€?
1. **Delete chat** 鈥?a trash button in the conversation header; confirming deletes (archives) the chat. The delete rides the runtime's own archive channel (`workspace.archiveSession`), sharing one state with the stock "Archive session" menu and every other plugin 鈥?no conflicts by construction.
2. **Settings 鈫?Archived chats** 鈥?lists every archived chat (title, time, workspace, running status):
   - **View**: read the full transcript in a modal 鈥?user/assistant messages, tool calls (with arguments), and tool results (with error flags); tool names are correlated through the log's `tool/call` 鈫?`tool/result` pairing.
   - **Restore**: moves the chat out of the archive back to its original workspace position (through the workspace storage domain's native state write; all tabs sync live).
   - **Export**: as **Markdown** (readable transcript) or **JSONL** (the complete raw event log, one event per line).
   - **Delete permanently**: removes the persisted log (irreversible) and prunes the workspace account, projection cache, and archive-set references.
   - Only a session whose agent is actually RUNNING (an open, unfinished turn) refuses deletion; idle sessions 鈥?including ones opened earlier this process and still in memory 鈥?delete and restore cleanly (the leftover in-memory object is retired first so it cannot write the file back). The "Running" badge uses the same open-turn test, so stopped chats never show it falsely.

## 瀹夎 / Install

```sh
dsh plugin --profile web add dsh-session-admin@0.1.0
```

The package's `dsh.bundle.patch` appends the plugin row to the profile bundle stack; the row is strictly additive (it restates no stock row), so it cannot conflict with other plugins or future upgrades.

## 鏋舵瀯 / Architecture

- **Host half** (`lib/index.js`): mounts fenced `/session-manager/api/{list,read,delete}` routes (loopback/trusted-host fence, same policy as the stock `/api` gateway and dsh-better-sidebar). Reads the archive set from `ctx.workspaceRegistry`, titles and surfaces from `ctx.sessionQuery`, and artifacts from `ctx.sessionPersistence`. Deletion removes the session-owned artifact directory (the documented out-of-band maintenance path 鈥?the seam has no deletion API); the JSONL backend rediscovers the layout on the next list and the FTS index reconciles itself.
- **Client half** (`lib/client.js`): registers the `settings.section` page and the `conversation.session.header.actions` button through the slot system (`ctx.slots.inject` waits for the declaring shells). No DOM interception, no service replacement, no stock-row patches. All styles are prefixed `dsm-` and ride the shared `--dsw-*` theme tokens; copy follows the DSH locale registry (zh/en).

## 鏋勫缓 / Build

```sh
pnpm install   # or npm install (esbuild only)
npm run build  # emits lib/index.js + lib/client.js
```

## 鑷祴 / Acceptance test

浠撳簱澶栭殢鎻掍欢鎻愪緵 `test-ui.mjs`锛岀敤 puppeteer-core + 绯荤粺 Chromium 椹卞姩鐪熷疄娴忚鍣ㄥ仛绔埌绔獙鏀讹細鍒犻櫎鎸夐挳銆佸綊妗ｃ€佽缃〉褰掓。鍒楄〃銆佽浆鍐欐煡鐪嬨€佹案涔呭垹闄ゃ€佺鐩樻竻鐞嗭紝浠ュ強涓庡畼鏂逛細璇濊彍鍗曞拰 `dsh-better-sidebar` 鐨勫叡瀛橈紙11/11 鐢ㄤ緥锛夈€傝繍琛屾柟寮忥細

```sh
# 1. 鐢ㄩ殧绂荤殑 DSH_HOME 鍚姩娴嬭瘯瀹炰緥锛堝叡浜湡瀹?profiles锛岄殧绂绘暟鎹級锛?#    $env:DSH_HOME=<temp-home>锛屾妸鐪熷疄 profiles 鐩綍 junction 鍒?<temp-home>/profiles
#    $env:DSH_HOME=...; dsh web --port 3099
# 2. node test-ui.mjs
```
