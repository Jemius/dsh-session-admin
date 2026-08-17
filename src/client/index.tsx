/**
 * Client half of dsh-session-admin:
 * - registers the plugin's zh/en dictionaries into the shared locale registry,
 * - contributes the "已归档的聊天 / Archived chats" page to the Settings
 *   shell through the `settings.section` slot,
 * - adds the per-session Delete button to the conversation header through the
 *   `conversation.session.header.actions` slot.
 *
 * Both registrations ride `ctx.slots.inject()` so they wait for the declaring
 * shell entries instead of assuming activation order — the documented
 * third-party discipline (same as dsh-better-sidebar). No DOM interception,
 * no service replacement: nothing here can conflict with other plugins.
 */
import { ArchivedSection, HeaderDeleteAction, bindWorkspaces } from './ui.tsx'
import { LOCALE_NS, attachLocale, t, zh, en } from './loc.ts'

/** The style tag id for the plugin-owned CSS (the loader inventories it per-module). */
const CSS_TAG_ID = 'dsh-session-admin/styles.module.css'

/** Inject the bundled stylesheet once per page (idempotent across HMR re-activations). */
function injectStyles(cssText: string): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(CSS_TAG_ID)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'dsh-session-admin'
  tag.dataset.pluginCss = CSS_TAG_ID
  tag.textContent = cssText
  document.head.appendChild(tag)
}

// Bundled CSS text: inlined by the build script as `__DSM_CSS_TEXT__` in the
// __ModuleLoader__ wrapper (the same artifact is also emitted for HMR).
declare const __DSM_CSS_TEXT__: string

/** Services required before the plugin activates (provided by the client runtime). */
export const inject = ['slots', 'workspaces', 'locale']

/** Structural client context face (mirror of the runtime shapes this plugin touches). */
export interface ClientContext {
  slots: {
    register(options: {
      name: string
      id?: string
      order?: number
      label?: string | (() => string)
      registrant?: string
      inject?: (...args: unknown[]) => Record<string, unknown>
    }, component: unknown): () => void
    inject(key: string, callback: () => () => void): () => void
  }
  workspaces: {
    archiveSession(sessionId: string): Promise<void>
  }
  locale: {
    getSnapshot(): { active: string }
    subscribe(fn: () => void): () => void
    register(ns: string, locale: string, dict: Record<string, string>): () => void
  }
  effect(fn: () => void | (() => void), label?: string): void
}

/**
 * Client plugin body.
 * @param ctx - the client cordis context (slots, workspaces, locale).
 */
export function apply(ctx: ClientContext): void {
  injectStyles(__DSM_CSS_TEXT__)
  attachLocale(ctx.locale)
  bindWorkspaces(ctx.workspaces)

  ctx.effect(() => {
    const offZh = ctx.locale.register(LOCALE_NS, 'zh', zh)
    const offEn = ctx.locale.register(LOCALE_NS, 'en', en)
    return () => { offZh(); offEn() }
  }, 'dsh-session-admin: dictionaries')

  // The Archived chats settings page. The shell resolves the locale-following
  // label thunk on each nav projection, so language switches relabel the nav
  // without re-registration.
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'session-archive',
    order: 110,
    label: () => t('nav'),
    registrant: 'dsh-session-admin',
    inject: () => ({}),
  }, ArchivedSection))

  // The per-session Delete button in the conversation header's action row.
  // Session scope: the framework kit supplies sessionId + useSessions.
  ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
    name: 'conversation.session.header.actions',
    id: 'session-manager-delete',
    order: 50,
    registrant: 'dsh-session-admin',
    inject: () => ({}),
  }, HeaderDeleteAction))
}
