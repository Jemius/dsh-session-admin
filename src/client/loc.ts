/**
 * zh/en copy for the session manager. The copy follows the DSH i18n system:
 * the client apply attaches the locale service (`ctx.locale`, provided by
 * @deepseek-ai/dsh-client-locale), and `t()` resolves the active locale from
 * it — the Host-backed `locale.preference` wins over the browser language and
 * switches live. The dictionaries are also registered into the DSH locale
 * registry under LOCALE_NS.
 */

/** The zh dictionary. */
export const zh = {
  // settings section
  nav: '已归档的聊天',
  intro: '查看已删除（归档）的会话，恢复查看或永久删除',
  empty: '没有已归档的聊天',
  emptyDesc: '删除会话时，会话会先归档到这里，之后仍可查看或永久删除。',
  refresh: '刷新',
  loading: '加载中…',
  loadError: '加载失败',
  retry: '重试',
  // rows
  running: '运行中',
  view: '查看',
  delete: '永久删除',
  deleted: '已永久删除',
  // viewer
  viewerTitle: '会话记录',
  viewerTruncated: '内容较长，仅显示最近的 {n} 条消息',
  toolCall: '调用工具',
  toolResult: '工具结果',
  toolError: '失败',
  close: '关闭',
  restore: '恢复',
  restoreConfirmTitle: '恢复会话',
  restoreConfirmDesc: '将把「{name}」恢复到原工作区位置，从已归档列表中移出。',
  restoredToast: '会话已恢复',
  restoreFailed: '恢复失败',
  export: '导出',
  exportMarkdown: '导出为 Markdown',
  exportJsonl: '导出为 JSONL',
  exportFailed: '导出失败',
  // delete confirm
  deleteTitle: '永久删除会话',
  deleteDesc: '将永久删除「{name}」的全部记录，此操作无法撤销。',
  deleteConfirm: '确认删除',
  cancel: '取消',
  deleteFailed: '删除失败',
  // header delete action
  headerDelete: '删除会话',
  headerDeleteConfirmTitle: '删除会话',
  headerDeleteConfirmDesc: '将删除「{name}」，会话会移入 设置 → 已归档的聊天，可随时查看。',
  headerDeleteConfirm: '删除',
  archivedToast: '会话已删除，可在 设置 → 已归档的聊天 中查看',
  archiveFailed: '删除失败',
  // time
  timeJustNow: '刚刚',
  timeMinutesAgo: '{n} 分钟前',
  timeHoursAgo: '{n} 小时前',
  timeYesterday: '昨天',
}

/** The en dictionary. */
export const en: typeof zh = {
  nav: 'Archived chats',
  intro: 'View deleted (archived) chats — read their transcripts or delete them permanently',
  empty: 'No archived chats',
  emptyDesc: 'When you delete a chat it is archived here first; you can still view or permanently delete it.',
  refresh: 'Refresh',
  loading: 'Loading…',
  loadError: 'Failed to load',
  retry: 'Retry',
  running: 'Running',
  view: 'View',
  delete: 'Delete permanently',
  deleted: 'Deleted permanently',
  viewerTitle: 'Transcript',
  viewerTruncated: 'Long transcript — showing the latest {n} messages only',
  toolCall: 'Call tool',
  toolResult: 'Tool result',
  toolError: 'error',
  close: 'Close',
  restore: 'Restore',
  restoreConfirmTitle: 'Restore chat',
  restoreConfirmDesc: 'Move "{name}" back to its original workspace position and out of the archive.',
  restoredToast: 'Chat restored',
  restoreFailed: 'Restore failed',
  export: 'Export',
  exportMarkdown: 'Export as Markdown',
  exportJsonl: 'Export as JSONL',
  exportFailed: 'Export failed',
  deleteTitle: 'Delete chat permanently',
  deleteDesc: 'This permanently deletes every record of "{name}" and cannot be undone.',
  deleteConfirm: 'Delete',
  cancel: 'Cancel',
  deleteFailed: 'Delete failed',
  headerDelete: 'Delete chat',
  headerDeleteConfirmTitle: 'Delete chat',
  headerDeleteConfirmDesc: 'Delete "{name}"? It moves to Settings → Archived chats, where you can view it anytime.',
  headerDeleteConfirm: 'Delete',
  archivedToast: 'Chat deleted — find it under Settings → Archived chats',
  archiveFailed: 'Delete failed',
  timeJustNow: 'just now',
  timeMinutesAgo: '{n} min ago',
  timeHoursAgo: '{n} h ago',
  timeYesterday: 'yesterday',
}

/** The dictionary namespace this plugin owns in the DSH locale registry. */
export const LOCALE_NS = 'sessionManager'

/** The DSH locale service attached by the client apply. */
let localeService: { getSnapshot(): { active: string } } | undefined

/** Attach (or detach, with undefined) the DSH locale service. */
export function attachLocale(service: { getSnapshot(): { active: string } } | undefined): void {
  localeService = service
}

/** The active locale id ('zh' | 'en'). */
function activeLocale(): string {
  return localeService?.getSnapshot().active
    ?? (typeof navigator !== 'undefined' ? navigator.language : '')
    ?? 'en'
}

export type CopyKey = keyof typeof zh

/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
export function t(key: CopyKey, params?: Record<string, string | number>): string {
  const dict = activeLocale().toLowerCase().startsWith('zh') ? zh : en
  let text = dict[key]
  if (params !== undefined) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}

/** Whether the active locale is Chinese. */
export function isZh(): boolean {
  return activeLocale().toLowerCase().startsWith('zh')
}

/** Format an epoch-ms timestamp relative to now (刚刚 / N 分钟前 / … / date). */
export function relativeTime(epochMs: number): string {
  const then = new Date(epochMs)
  if (Number.isNaN(then.getTime())) return ''
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000)
  if (seconds < 60) return t('timeJustNow')
  if (seconds < 3600) return t('timeMinutesAgo', { n: Math.floor(seconds / 60) })
  if (seconds < 86400) return t('timeHoursAgo', { n: Math.floor(seconds / 3600) })
  if (seconds < 172800) return t('timeYesterday')
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${then.getFullYear()}-${pad(then.getMonth() + 1)}-${pad(then.getDate())}`
}
