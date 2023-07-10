import type { RequestHandler } from "./$types";
import type { Minion } from "$lib/types";
import { prisma } from "$lib/server/prisma";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: object;
  distinct?: any;
  where?: any;
};

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

  console.log(params);

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
