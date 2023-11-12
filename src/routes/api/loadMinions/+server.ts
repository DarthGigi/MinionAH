import type { RequestHandler } from "./$types";
import type { Seller } from "$lib/types";
import prisma from "$lib/server/prisma";

type Params = {
  take?: number;
  skip?: number;
  orderBy?: object;
  distinct?: any;
  where?: any;
};

async function getMinions(take: number = 9, skip?: number, orderBy: object = [{ timeCreated: "desc" }, { price: "asc" }], distinct?: any, where?: any) {
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
          accent_color: true,
          avatar: true,
          banner: true,
          id: true,
          locale: true,
          loggedInAt: false,
          username: true
        }
      }
    }
  });

  return minions as Seller[];
}

export const POST: RequestHandler = async ({ request }) => {
  // Switch from GET to POST
  const params: Params = await request.json();

  let minions;
  try {
    minions = await getMinions(Math.min(50, params.take || 9), params.skip, params.orderBy, params.distinct, params.where);
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
