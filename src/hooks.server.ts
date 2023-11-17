import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { RateLimiter } from "sveltekit-rate-limiter/server";
import { error } from "@sveltejs/kit";

const limiter = new RateLimiter({
  rates: {
    IP: [60, "h"],
    IPUA: [60, "h"],
    cookie: {
      name: "limiterid",
      secret: "secret",
      rate: [60, "h"],
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
