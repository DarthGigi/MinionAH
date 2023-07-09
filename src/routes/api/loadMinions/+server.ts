import type { RequestHandler } from "./$types";
import type { Minion } from "$lib/types";
import { json } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

async function getMinions(take: number = 9, skip: number) {
  let minions = await prisma.minion.findMany({
    take,
    skip,
    orderBy: [
      {
        generator: "asc"
      },
      {
        generator_tier: "asc"
      }
    ]
  });

  return minions as Minion[];
}

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  return new Response(JSON.stringify(await getMinions(data.take, data.skip)), {
    headers: {
      "Content-Type": "application/json"
    }
  });
};
