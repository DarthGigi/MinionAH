import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { RetryAfterRateLimiter } from "sveltekit-rate-limiter/server";
import { RATE_LIMIT_SECRET } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

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
    console.log(status);
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
    const userKey = await prisma.key.findFirst({
      where: {
        id: "username:" + event.locals.user.username.toLocaleLowerCase()
      }
    });

    if (userKey && userKey.hashed_password) {
      redirect(302, "/profile");
    }
  }

  return await resolve(event);
};
