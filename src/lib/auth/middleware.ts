import { createMiddleware } from "@tanstack/react-start";

/**
 * Auth middleware for server functions — the standard way to get the caller's
 * verified user id. The session is resolved server-side and the client may only
 * provide a bearer token for the partitioned live-preview environment.
 */
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUserId } = await import("./verify.server");
    assertSameSiteRequest();
    const userId = await requireUserId(context.bearerToken);
    return next({ context: { userId } });
  });
