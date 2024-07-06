import prisma from "$lib/server/prisma";
import type { Seller } from "$lib/types";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  distinct?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where?: any;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getMinions(take: number = 18, skip?: number, orderBy: object = [{ timeCreated: "desc" }, { price: "asc" }], distinct?: any, where?: any) {
  const minions = await prisma.auction.findMany({
    take,
    skip,
    orderBy,
    distinct,
    where,
    include: {
      minion: true,
      user: {
        select: {
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

  try {
    const minions = await getMinions(Math.min(50, params.take || 18), typeof params.skip === "number" ? params.skip : parseInt(params.skip || "0"), params.orderBy, params.distinct, JSON.parse(params.where || "{}"));
    return json(minions);
  } catch (e) {
    console.error(e);
    return new Response("An error occurred while fetching minions", {
      status: 500
    });
  }
};
