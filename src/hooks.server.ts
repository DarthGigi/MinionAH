import { auth } from "$lib/server/lucia";
import type { Handle } from "@sveltejs/kit";
import { dev } from "$app/environment";

const MAX_REQUESTS_PER_MINUTE = 60;
const requestCounts = new Map<string, number>();

setInterval(() => {
  requestCounts.clear();
}, 60 * 1000);

export const handle: Handle = async ({ event, resolve }) => {
  const ip = !dev ? event.request.headers.get("CF-Connecting-IP") || event.request.headers.get("X-Forwarded-For") || event.request.headers.get("X-Real-IP") || event.request.headers.get("X-Client-IP") || event.request.headers.get("X-Cluster-Client-IP") || event.request.headers.get("X-Forwarded") || event.request.headers.get("Forwarded-For") || event.request.headers.get("Forwarded") : "127.0.0.1";

  if (!ip) {
    return new Response(
      JSON.stringify({
        error: "No IP address found"
      }),
      {
        status: 400
      }
    );
  }

  const requestCount = requestCounts.get(ip) || 0;

  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return new Response(
      JSON.stringify({
        error: "You have made too many requests"
      }),
      {
        status: 429
      }
    );
  }

  requestCounts.set(ip, requestCount + 1);

  event.locals.auth = auth.handleRequest(event);
  return await resolve(event);
};
