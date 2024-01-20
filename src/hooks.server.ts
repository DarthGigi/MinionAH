import { dev } from "$app/environment";
import { RATE_LIMIT_SECRET } from "$env/static/private";
import { auth } from "$lib/server/lucia";
import prisma from "$lib/server/prisma";
import type { Handle } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";

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

export const handle: Handle = async ({ event, resolve }) => {
  if (!dev) {
    await limiter.cookieLimiter?.preflight(event);

    const status = await limiter.check(event);

    if (status.limited) {
      event.setHeaders({
        "Retry-After": status.retryAfter.toString()
      });
      return new Response("Too many requests", {
        status: 429,
        headers: {
          "Retry-After": status.retryAfter.toString()
        },
        statusText: "You have made too many requests, please try again later."
      });
    }
  }

  event.locals.auth = auth.handleRequest(event);

  const session = await event.locals.auth.validate();

  if (session) {
    event.locals.session = session;
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.userId
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

    event.locals.session = session;
    user ? (event.locals.user = user) : (event.locals.user = null);
    if (user) {
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
      if (user._count.key > 0 && event.url.pathname !== "/signup/password") {
        redirect(302, "/signup/password");
      }
    }
  } else {
    event.locals.session = null;
    event.locals.user = null;
  }

  const isProtectedRoute = event.route.id?.includes("(protected)") ?? false;
  const path = event.url.pathname;

  if ((path === "/login" || path === "/signup") && (event.locals.session || event.locals.user)) {
    redirect(302, "/profile");
  }

  if (isProtectedRoute && (!event.locals.session || !event.locals.user)) {
    redirect(302, "/login");
  }

  if (path === "/signup/password" && event.locals.session) {
    if (!event.locals.user) redirect(302, "/login");

    if (event.locals.user._count.key < 1) {
      redirect(302, "/profile");
    }
  }

  return await resolve(event);
};
