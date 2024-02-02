import prisma from "$lib/server/prisma";
import type { Seller } from "$lib/types";
import type { RequestHandler } from "./$types";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: object;
  distinct?: any;
  where?: any;
};

async function getMinions(take: number = 18, skip?: number, orderBy: object = [{ timeCreated: "desc" }, { price: "asc" }], distinct?: any, where?: any) {
  let minions = await prisma.minionSeller.findMany({
    take,
    skip,
    orderBy,
    distinct,
    where,
    include: {
      minion: true,
      user: {
        select: {
          avatar: true,
          id: true,
          loggedInAt: true,
          username: true
        }
      }
    }
  });

  return minions as Seller[];
}

export const GET: RequestHandler = async ({ url }) => {
  const params: Params = Object.fromEntries(new URLSearchParams(url.search));

  let minions;
  try {
    minions = await getMinions(Math.min(50, params.take || 18), typeof params.skip === "number" ? params.skip : parseInt(params.skip || "0"), params.orderBy, params.distinct, JSON.parse(params.where || "{}"));
  } catch (e) {
    console.error(e);
    return new Response("An error occurred while fetching minions", {
      status: 500
    });
  }

  return new Response(JSON.stringify(minions), {
    headers: {
      "Content-Type": "application/json"
    }
  });
};
