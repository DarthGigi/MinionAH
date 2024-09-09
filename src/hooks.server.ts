import { dev } from "$app/environment";
import { ADMIN_ID, DISCORD_BOT_API_SECRET, MAINTENANCE_MODE, RATE_LIMIT_SECRET } from "$env/static/private";
import { PUBLIC_SENTRY_DSN } from "$env/static/public";
import { lucia } from "$lib/server/lucia";
import prisma from "$lib/server/prisma";
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

export const handle: Handle = sequence(sentryHandle(), async ({ event, resolve }) => {
  if (MAINTENANCE_MODE === "true") {
    redirect(303, "https://maintenance.minionah.com");
  }

  if (!dev || event.request.headers.get("Authorization") !== DISCORD_BOT_API_SECRET) {
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

  async function resetEventLocals(event: RequestEvent<Partial<Record<string, string>>, string | null>) {
    event.locals.user = null;
    event.locals.session = null;
  }

  try {
    const sessionId = event.cookies.get(lucia.sessionCookieName);

    if (sessionId) {
      const { session } = await lucia.validateSession(sessionId);
      if (session) {
        if (session.fresh) {
          const sessionCookie = lucia.createSessionCookie(session.id);
          event.cookies.set(sessionCookie.name, sessionCookie.value, {
            path: ".",
            ...sessionCookie.attributes
          });
        }

        const user = await prisma.user.findUnique({
          where: {
            id: session.userId
          },
          include: {
            _count: {
              select: {
                chatsAsUser1: {
                  where: {
                    user1Read: false
                  }
                },
                chatsAsUser2: {
                  where: {
                    user2Read: false
                  }
                },
                key: {
                  //where id starts with username:
                  where: {
                    id: {
                      startsWith: "username:"
                    },
                    hashed_password: {
                      equals: null
                    }
                  }
                }
              }
            }
          }
        });
        if (user) {
          event.locals.user = user;
          event.locals.session = session;
          // if the time difference is more than an hour, update the loggedInAt time
          const timeDifference = new Date().getTime() - user.loggedInAt.getTime();
          if (timeDifference > 3600000) {
            await prisma.user.update({
              where: {
                id: user.id
              },
              data: {
                loggedInAt: new Date()
              }
            });
          }
          if (user.id === ADMIN_ID) {
            event.locals.isAdmin = true;
          }
        } else {
          event.locals.user = null;
          event.locals.session = null;
        }
      } else {
        const sessionCookie = lucia.createBlankSessionCookie();
        event.cookies.set(sessionCookie.name, sessionCookie.value, {
          path: ".",
          ...sessionCookie.attributes
        });
        resetEventLocals(event);
      }
    } else {
      resetEventLocals(event);
    }
  } catch (error) {
    console.error(error);
    resetEventLocals(event);
  }

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

  return await resolve(event);
});
export const handleError = handleErrorWithSentry();

export const reroute: Reroute = ({ url }) => {
  if (url.pathname === "/pricechecker") {
    return "/pricecheck";
  }
};
