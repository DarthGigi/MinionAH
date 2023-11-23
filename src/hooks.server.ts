import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import { error } from "@sveltejs/kit";
import { RATE_LIMIT_SECRET } from "$env/static/private";

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

  return await resolve(event);
};
