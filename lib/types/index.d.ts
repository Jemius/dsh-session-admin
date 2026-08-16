/**
 * Host half of dsh-session-admin: the fenced /session-manager/api JSON
 * routes (list / read / delete) over the shared workspace archive set.
 */
export declare const name = 'dsh-session-admin'
/** Host services required at activation (webServer, workspaceRegistry). */
export declare const inject: string[]
/** Mount the fenced API routes (disposed with the fiber). */
export declare function apply(ctx: unknown): void
