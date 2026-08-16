/**
 * The session-manager UI: the Archived chats settings section, its
 * transcript viewer modal, and the conversation-header Delete button.
 * Pure React over @deepseek-ai/dsh-client-ui-primitives; all copy goes
 * through the plugin locale seat; all class names carry the `dsm-` prefix.
 */
import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, IconTrashOutline16, IconNewChatOutline16, IconRefreshOutline16, IconCloseOutline16, Modal, Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import { api, downloadText, ArchiveApiError, type ArchivedChatItem, type TranscriptValue } from './api.ts'
import { relativeTime, t } from './loc.ts'
import css from './styles.module.css'

/** Map a host error code to localized copy (raw message as fallback). */
function describeError(error: unknown): string {
  if (error instanceof ArchiveApiError) {
    if (error.code === 'session-active') return isZhCopy() ? '该会话正在运行中，请等待其完成后再试' : 'This chat is currently running — try again after it finishes'
    if (error.code === 'not-archived') return isZhCopy() ? '该会话不在归档列表中' : 'This chat is not in the archive'
    if (error.code === 'not-found') return isZhCopy() ? '接口不存在' : 'Unknown API method'
    if (error.code === 'forbidden') return isZhCopy() ? '请求被拒绝' : 'Request refused'
    if (error.code === 'network') return isZhCopy() ? '网络错误' : 'Network error'
    if (error.code === 'unsupported-backend' || error.code === 'unsafe-path' || error.code === 'unavailable') return error.message
  }
  return error instanceof Error ? error.message : String(error)
}

/** Localize without importing the active-locale plumbing into components. */
function isZhCopy(): boolean {
  return (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh'))
}

/**
 * Show a transient toast that OUTLIVES the calling component. Each show
 * mounts its own React root on a body portal and tears it down when the
 * Toast completes — a session-scoped caller (the header delete button) is
 * unmounted by the runtime when its session clears, so component-held toast
 * state would die with it.
 */
function showToast(text: string): void {
  if (typeof document === 'undefined') return
  const host = document.createElement('div')
  host.setAttribute('data-dsm-toast', '')
  document.body.appendChild(host)
  const root = createRoot(host)
  const cleanup = (): void => {
    try {
      root.unmount()
    } catch {
      // Root already unmounted (double onDone) — the removal below is enough.
    }
    host.remove()
  }
  root.render(<Toast text={text} onDone={cleanup} />)
}

/** Relative time plus the host-local date. */
function timeLabel(epochMs: number): string {
  return relativeTime(epochMs)
}

/* ── Transcript viewer ─────────────────────────────────────────────────── */

function TranscriptModal(props: {
  sessionId: string
  title: string
  onClose: () => void
  /** Called after a successful restore (the parent closes the viewer, refreshes, toasts). */
  onRestored: () => void
}) {
  const [value, setValue] = useState<TranscriptValue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    setValue(null)
    setError(null)
    api.read(props.sessionId).then(
      (result) => { if (!cancelled) setValue(result) },
      (reason: unknown) => { if (!cancelled) setError(describeError(reason)) },
    )
    return () => { cancelled = true }
  }, [props.sessionId])

  const doRestore = (): void => {
    if (busy) return
    setBusy(true)
    api.restore(props.sessionId).then(
      () => { setBusy(false); props.onRestored() },
      (reason: unknown) => {
        setBusy(false)
        showToast(`${t('restoreFailed')}: ${describeError(reason)}`)
      },
    )
  }

  const doExport = (format: 'markdown' | 'jsonl'): void => {
    if (busy) return
    setBusy(true)
    api.export(props.sessionId, format).then(
      (result) => {
        setBusy(false)
        downloadText(result)
        showToast(`${t('export')} · ${result.filename}`)
      },
      (reason: unknown) => {
        setBusy(false)
        showToast(`${t('exportFailed')}: ${describeError(reason)}`)
      },
    )
  }

  return (
    <Modal
      open
      onClose={props.onClose}
      title={`${t('viewerTitle')} · ${props.title}`}
      closeLabel={t('close')}
      headless
      className={css.dsmViewerModal}
    >
      <div className={css.dsmViewerHead}>
        <h2 className={css.dsmViewerTitle}>{`${t('viewerTitle')} · ${props.title}`}</h2>
        <button type="button" className={css.dsmViewerClose} aria-label={t('close')} onClick={props.onClose}>
          <IconCloseOutline16 size={14} />
        </button>
      </div>
      <div className={css.dsmViewerScroll}>
        {error !== null && <div className={css.dsmError}>{error}</div>}
        {value === null && error === null && <div className={css.dsmStatus}>{t('loading')}</div>}
        {value !== null && (
          <>
            <div className={css.dsmViewerMeta}>
              <span>{timeLabel(value.createdAt)}</span>
              <span>{value.messages.length} {isZhCopy() ? '条消息' : 'messages'}</span>
            </div>
            {value.truncated && <div className={css.dsmViewerNote}>{t('viewerTruncated', { n: value.messages.length })}</div>}
            <div className={css.dsmViewer}>
              {value.messages.map(message => (
                <div key={message.seq} className={`${css.dsmMsg} ${message.kind === 'user' ? css.dsmMsgUser : message.kind === 'assistant' ? css.dsmMsgAssistant : css.dsmMsgTool}`}>
                  <span className={css.dsmRole}>
                    {message.kind === 'user' ? (isZhCopy() ? '用户' : 'User') : message.kind === 'assistant' ? (isZhCopy() ? '助手' : 'Assistant') : `${t('toolResult')}${message.toolName !== undefined ? ` · ${message.toolName}` : ''}${message.isError === true ? ` · ${t('toolError')}` : ''}`}
                  </span>
                  {message.toolCalls !== undefined && message.toolCalls.length > 0 && (
                    <div className={css.dsmToolCalls}>
                      {message.toolCalls.map((call, index) => (
                        <span key={index} className={css.dsmToolCall}>
                          <span>{t('toolCall')}</span>
                          <span className={css.dsmToolCallName}>{call.name}</span>
                          {call.inputText !== '' && <span className={css.dsmToolCallInput}>{call.inputText}</span>}
                        </span>
                      ))}
                    </div>
                  )}
                  {message.text !== '' && <div className={`${css.dsmBubble}${message.isError === true ? ` ${css.dsmBubbleError}` : ''}`}>{message.text}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className={css.dsmViewerFooter}>
        <div className={css.dsmViewerActions}>
          <Button variant="outline" size="sm" disabled={busy} onClick={doRestore}>{t('restore')}</Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => { doExport('markdown') }}>{t('exportMarkdown')}</Button>
          <Button variant="ghost" size="sm" disabled={busy} onClick={() => { doExport('jsonl') }}>{t('exportJsonl')}</Button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Archived chats settings section ───────────────────────────────────── */

function ArchivedSection(props: { close: () => void }) {
  const [items, setItems] = useState<ArchivedChatItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<{ sessionId: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState<ArchivedChatItem | null>(null)
  const [busy, setBusy] = useState(false)

  const load = (): void => {
    setError(null)
    api.list().then(
      (result) => { setItems(result.items) },
      (reason: unknown) => { setError(describeError(reason)); setItems(items => items ?? []) },
    )
  }

  useEffect(load, [])

  const confirmDelete = (): void => {
    if (deleting === null) return
    setBusy(true)
    api.delete(deleting.sessionId).then(
      (result) => {
        setItems(result.items)
        setDeleting(null)
        setBusy(false)
        showToast(t('deleted'))
      },
      (reason: unknown) => {
        setDeleting(null)
        setBusy(false)
        showToast(`${t('deleteFailed')}: ${describeError(reason)}`)
      },
    )
  }

  return (
    <div className={css.dsmSection}>
      <p className={css.dsmIntro}>{t('intro')}</p>
      <div className={css.dsmToolbar}>
        <span className={css.dsmCount}>
          {items === null ? '' : isZhCopy() ? `${items.length} 个会话` : `${items.length} chats`}
        </span>
        <Button variant="ghost" size="sm" icon={<IconRefreshOutline16 size={14} />} onClick={load}>{t('refresh')}</Button>
      </div>

      {items === null && error === null && <div className={css.dsmStatus}>{t('loading')}</div>}
      {items !== null && error !== null && <div className={css.dsmStatus}><span className={css.dsmError}>{error}</span><Button variant="ghost" size="sm" onClick={load}>{t('retry')}</Button></div>}
      {items !== null && items.length === 0 && error === null && (
        <div className={css.dsmEmpty}>
          <IconNewChatOutline16 size={28} />
          <div className={css.dsmEmptyTitle}>{t('empty')}</div>
          <div className={css.dsmEmptyDesc}>{t('emptyDesc')}</div>
        </div>
      )}
      {items !== null && items.length > 0 && (
        <div className={css.dsmList}>
          {items.map(item => (
            <div key={item.sessionId} className={css.dsmRow}>
              <div className={css.dsmRowMain}>
                <span className={css.dsmTitle}>{item.displayTitle}</span>
                <span className={css.dsmMeta}>
                  <span>{timeLabel(item.createdAt)}</span>
                  {item.cwd !== null && <span className={css.dsmCwd} title={item.cwd}>{item.cwd}</span>}
                  {item.live && <span className={css.dsmLive}>{t('running')}</span>}
                </span>
              </div>
              <div className={css.dsmRowActions}>
                <Button variant="outline" size="sm" onClick={() => { setViewing({ sessionId: item.sessionId, title: item.displayTitle }) }}>{t('view')}</Button>
                <Button variant="ghost" size="sm" icon={<IconTrashOutline16 size={14} />} onClick={() => { setDeleting(item) }}>{t('delete')}</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewing !== null && (
        <TranscriptModal
          sessionId={viewing.sessionId}
          title={viewing.title}
          onClose={() => { setViewing(null) }}
          onRestored={() => {
            setViewing(null)
            load()
            showToast(t('restoredToast'))
          }}
        />
      )}
      {deleting !== null && (
        <Modal
          open
          onClose={() => { if (!busy) setDeleting(null) }}
          title={t('deleteTitle')}
          closeLabel={t('close')}
          description={t('deleteDesc', { name: deleting.displayTitle })}
          footer={(
            <>
              <Button variant="ghost" disabled={busy} onClick={() => { setDeleting(null) }}>{t('cancel')}</Button>
              <Button variant="primary" disabled={busy} onClick={confirmDelete}>{busy ? t('loading') : t('deleteConfirm')}</Button>
            </>
          )}
        >
          <div />
        </Modal>
      )}
    </div>
  )
}

/* ── Conversation-header Delete button ─────────────────────────────────── */

/** Structural selector-hook face (the runtime merges `useSessions` into the global standard kit). */
type SessionsSelectorHook = <S>(sel: (state: { byId: Record<string, { displayTitle?: string }> }) => S) => S

function HeaderDeleteAction(props: { sessionId: string; useSessions: SessionsSelectorHook }) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const title = props.useSessions(state => state.byId[props.sessionId]?.displayTitle ?? props.sessionId)

  const doArchive = (): void => {
    setBusy(true)
    workspacesRef.archiveSession(props.sessionId).then(
      () => {
        setBusy(false)
        setConfirming(false)
        showToast(t('archivedToast'))
      },
      (reason: unknown) => {
        setBusy(false)
        setConfirming(false)
        showToast(`${t('archiveFailed')}: ${describeError(reason)}`)
      },
    )
  }

  return (
    <>
      <button
        type="button"
        className={css.dsmHeaderButton}
        aria-label={t('headerDelete')}
        title={t('headerDelete')}
        onClick={() => { setConfirming(true) }}
      >
        <IconTrashOutline16 size={16} />
      </button>
      {confirming && (
        <Modal
          open
          onClose={() => { if (!busy) setConfirming(false) }}
          title={t('headerDeleteConfirmTitle')}
          closeLabel={t('close')}
          description={t('headerDeleteConfirmDesc', { name: title })}
          footer={(
            <>
              <Button variant="ghost" disabled={busy} onClick={() => { setConfirming(false) }}>{t('cancel')}</Button>
              <Button variant="primary" disabled={busy} onClick={doArchive}>{busy ? t('loading') : t('headerDeleteConfirm')}</Button>
            </>
          )}
        >
          <div />
        </Modal>
      )}
    </>
  )
}

/** The runtime workspace service face the header action drives. */
let workspacesRef: { archiveSession(sessionId: string): Promise<void> }

/** Bind the runtime workspace service (called once from the client apply). */
export function bindWorkspaces(workspaces: { archiveSession(sessionId: string): Promise<void> }): void {
  workspacesRef = workspaces
}

/** Export the two slot components. */
export { ArchivedSection, HeaderDeleteAction }
