import type { RequestHandler } from "./$types";
import type { Minion } from "$lib/types";
import prisma from "$lib/server/prisma";
import { dev } from "$app/environment";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: object;
  distinct?: any;
  where?: any;
};

const MAX_REQUESTS_PER_MINUTE = 30;

const requestCounts = new Map<string, number>();

setInterval(() => {
  requestCounts.clear();
}, 60 * 1000);

async function getMinions(take: number = 9, skip?: number, orderBy: object = [{ generator: "asc" }, { generator_tier: "asc" }], distinct?: any, where?: any) {
  let minions = await prisma.minion.findMany({
    take,
    skip,
    orderBy,
    distinct,
    where
  });

  return minions as Minion[];
}

export const POST: RequestHandler = async ({ request }) => {
  // Switch from GET to POST
  const params: Params = await request.json();

  const ip = !dev ? request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || request.headers.get("X-Real-IP") || request.headers.get("X-Client-IP") || request.headers.get("X-Cluster-Client-IP") || request.headers.get("X-Forwarded") || request.headers.get("Forwarded-For") || request.headers.get("Forwarded") : "127.0.0.1";

  if (!ip) {
    return new Response("No IP address found", {
      status: 400
    });
  }

  const requestCount = requestCounts.get(ip) || 0;

  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return new Response("Too many requests", {
      status: 429
    });
  }

  requestCounts.set(ip, requestCount + 1);

  let minions;
  try {
    minions = await getMinions(params.take, params.skip, params.orderBy, params.distinct, params.where);
  } catch (e) {
    console.log(e);
    return new Response(null, {
      status: 500
    });
  }

  return new Response(JSON.stringify(minions), {
    headers: {
      "Content-Type": "application/json"
    }
  });
};
