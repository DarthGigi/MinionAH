import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import { error } from "@sveltejs/kit";
import { RATE_LIMIT_SECRET } from "$env/static/private";
import prisma from "$lib/server/prisma";

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

    if (await limiter.isLimited(event)) throw error(429, "You have made too many requests");
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

  event.locals.isProtectedRoute = event.route.id?.includes("(protected)") ?? false;
  return await resolve(event);
};
