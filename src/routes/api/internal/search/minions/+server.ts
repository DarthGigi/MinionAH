import prisma from "$lib/server/prisma";
import type { Seller } from "$lib/types";
import { Prisma } from "@prisma/client";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: Prisma.AuctionOrderByWithRelationInput[];
  distinct?: Prisma.AuctionScalarFieldEnum; // enum resolving to string
  where?: string; // resolves to Prisma.AuctionWhereInput;
};

async function getMinions({ take = 18, skip, orderBy = [{ timeCreated: "desc" }, { price: "asc" }], distinct, where }: Params) {
  const minions = await prisma.auction.findMany({
    take: take,
    skip,
    orderBy,
    distinct,
    where: where ? JSON.parse(where) : undefined,
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
    // modify params
    let take = Math.min(50, parseInt(`${params.take}` || "")); // parseInt safely parses string search params
    if (isNaN(take)) take = 18; // check for Not a Number

    let skip = parseInt(`${params.skip}` || "0");
    if (isNaN(skip)) skip = 0;
    // process request
    const minions = await getMinions({
      take,
      skip,
      orderBy: params.orderBy,
      distinct: params.distinct,
      where: params.where
    });
    return json(minions);
  } catch (e) {
    console.error(e);
    return new Response("An error occurred while fetching minions", {
      status: 500
    });
  }
};
