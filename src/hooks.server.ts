import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import { error } from "@sveltejs/kit";
import { RATE_LIMIT_SECRET } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

const limiter = new RateLimiter({
  rates: {
    IP: [60, "m"],
    IPUA: [60, "m"],
    cookie: {
      name: "limiterid",
      secret: RATE_LIMIT_SECRET,
      rate: [60, "m"],
      preflight: true
    }
  }
});

export const handle: Handle = async ({ event, resolve }) => {
  if (!dev) {
    await limiter.cookieLimiter?.preflight(event);

    if (await limiter.isLimited(event)) error(429, "You have made too many requests");
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
