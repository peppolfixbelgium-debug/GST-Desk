import { createMiddleware } from "@tanstack/react-start";

/**
 * Auth middleware for server functions. It resolves the verified Better Auth
 * session once and exposes both the stable user id and verified email to the
 * handler. Client-supplied identity is never trusted.
 */
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { getSessionUser } = await import("./verify.server");
    assertSameSiteRequest();
    const user = await getSessionUser(context.bearerToken);
    if (!user) {
      const { UnauthorizedError } = await import("./verify.server");
      throw new UnauthorizedError();
    }
    return next({ context: { userId: user.id, userEmail: user.email } });
  });
