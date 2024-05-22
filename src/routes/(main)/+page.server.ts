import type { Seller } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load = (async () => {
  return {
    minions: prisma.auction.findMany({
      take: 18,
      skip: 0,
      orderBy: [
        {
          timeCreated: "desc"
        },
        {
          price: "asc"
        }
      ],
      include: {
        minion: true,
        user: {
          select: {
            id: true,
            loggedInAt: true,
            username: true
          }
        }
      },
      cacheStrategy: {
        ttl: 30,
        swr: 60
      }
    }) as Promise<Seller[]>,
    minionTypes: prisma.minion.findMany({
      select: {
        id: true,
        generator: true,
        texture: true,
        maxTier: true
      },
      distinct: ["generator"],
      orderBy: {
        generator: "asc"
      },
      cacheStrategy: {
        ttl: 2629746 // 1 month
      }
    }),
    users: prisma.user.findMany({
      select: {
        id: true,
        username: true
      },
      cacheStrategy: {
        ttl: 86400, // 1 day
        swr: 60 // 1 minute
      },
      orderBy: {
        loggedInAt: "desc"
      }
    })
  };
}) as PageServerLoad;
