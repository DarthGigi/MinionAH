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

export const GET: RequestHandler = async ({ request }) => {
  const url = new URL(request.url);
  const params: Params = {
    take: Number(url.searchParams.get("take")) || 9,
    skip: Number(url.searchParams.get("skip")),
    orderBy: url.searchParams.get("orderBy") ? JSON.parse(url.searchParams.get("orderBy") as string) : [{ generator: "asc" }, { generator_tier: "asc" }],
    distinct: url.searchParams.get("distinct"),
    where: url.searchParams.get("where") ? JSON.parse(url.searchParams.get("where") as string) : undefined
  };

  const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key as keyof Params] = value;
    }
    return acc;
  }, {} as Params);

  let minions;
  try {
    minions = await getMinions(filteredParams.take, filteredParams.skip, filteredParams.orderBy as object, filteredParams.distinct, filteredParams.where);
    console.log(minions);
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
