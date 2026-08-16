/**
 * Client half of dsh-session-admin: the Archived chats settings section
 * and the conversation-header Delete button.
 */
export declare const inject: string[]
/** Structural client context face the plugin reads. */
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
/** Register dictionaries, the settings section, and the header action. */
export declare function apply(ctx: ClientContext): void
