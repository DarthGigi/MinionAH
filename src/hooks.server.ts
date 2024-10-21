import { dev } from "$app/environment";
import { ADMIN_ID, MAINTENANCE_MODE, RATE_LIMIT_SECRET } from "$env/static/private";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import { validateSessionToken } from "$lib/server/lucia/auth";
import { deleteSessionTokenCookie, setSessionTokenCookie } from "$lib/server/lucia/cookies";
import { contextLinesIntegration, extraErrorDataIntegration, handleErrorWithSentry, init, sentryHandle } from "@sentry/sveltekit";
import type { Handle, RequestEvent } from "@sveltejs/kit";
import { json, redirect, type Reroute } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";

init({
  dsn: PUBLIC_SENTRY_DSN,
  tracesSampleRate: dev ? 1.0 : 0.5,

  integrations: [contextLinesIntegration(), extraErrorDataIntegration()],

  // This option is required for capturing headers and cookies.
  sendDefaultPii: true,

  // Disable Sentry during development
  enabled: !dev,
  environment: dev ? "development" : "production"
});

const limiter = new RetryAfterRateLimiter({
  IP: [60, "15m"],
  IPUA: [40, "m"],
  cookie: {
    name: "limiterid",
    secret: RATE_LIMIT_SECRET,
    rate: [15, "10s"],
    preflight: true
  }
});

function resetEventLocals(event: RequestEvent) {
  event.locals.user = null;
  event.locals.session = null;
}

export const handle: Handle = sequence(sentryHandle(), async ({ event, resolve }) => {
  if (MAINTENANCE_MODE === "true") {
    redirect(303, "https://maintenance.minionah.com");
  }

  if (!dev) {
    await limiter.cookieLimiter?.preflight(event);

    const status = await limiter.check(event);

    if (status.limited) {
      event.setHeaders({
        "Retry-After": status.retryAfter.toString()
      });
      return json("Too many requests", {
        status: 429,
        headers: {
          "Retry-After": status.retryAfter.toString()
        },
        statusText: "You have made too many requests, please try again later."
      });
    }
  }

  try {
    const token = event.cookies.get("session") ?? null;

    if (token === null) {
      resetEventLocals(event);
      checkRoutes(event);
      return await resolve(event);
    }

    const { session, user } = await validateSessionToken(token);

    if (session !== null) {
      setSessionTokenCookie(event.cookies, token, session.expiresAt);
      if (user.id === ADMIN_ID) event.locals.isAdmin = true;
    } else {
      deleteSessionTokenCookie(event.cookies);
    }

    event.locals.session = session;
    event.locals.user = user;
  } catch (error) {
    console.error(error);
    resetEventLocals(event);
  }

  checkRoutes(event);

  return await resolve(event);
});

export const handleError = handleErrorWithSentry();

export const reroute: Reroute = ({ url }) => {
  if (url.pathname === "/pricechecker") {
    return "/pricecheck";
  }
};

function checkRoutes(event: RequestEvent) {
  const isProtectedRoute = event.route.id?.includes("(protected)") ?? false;
  const path = event.url.pathname;

  if ((path === "/login" || path === "/signup") && (event.locals.session || event.locals.user)) {
    redirect(302, "/profile");
  }

  if (isProtectedRoute && (!event.locals.session || !event.locals.user)) {
    redirect(302, "/login");
  }

  if (event.locals.user) {
    if (path !== "/signup/password" && event.locals.user._count.key > 0) {
      redirect(302, "/signup/password");
    }

    if (path === "/signup/password" && event.locals.user._count.key === 0) {
      redirect(302, "/profile");
    }
  }

  if (path.includes("dashboard") && !event.locals.isAdmin) {
    redirect(302, "/login");
  }
}
