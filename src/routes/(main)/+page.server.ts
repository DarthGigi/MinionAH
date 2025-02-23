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
      // @ts-expect-error - This isn't typed yet
      cacheStrategy: {
        ttl: 30,
        swr: 60
      }
    }) as Promise<Seller[]>,
    minionTypes: prisma.minion.findMany({
      select: {
        id: true,
        generator: true,
        maxTier: true
      },
      distinct: ["generator"],
      orderBy: {
        generator: "asc"
      },
      // @ts-expect-error - This isn't typed yet
      cacheStrategy: {
        ttl: 2629746 // 1 month
      }
    }),
    users: prisma.user.findMany({
      select: {
        id: true,
        username: true
      },
      // @ts-expect-error - This isn't typed yet
      cacheStrategy: {
        ttl: 86400, // 1 day
        swr: 60 // 1 minute
      },
      orderBy: {
        loggedInAt: "desc"
      }
    }),
    stats: {
      users: prisma.user.count({
        // @ts-expect-error - This isn't typed yet
        cacheStrategy: {
          ttl: 86400, // 1 day
          swr: 60 // 1 minute
        }
      }),
      auctions: prisma.auction.count({
        // @ts-expect-error - This isn't typed yet
        cacheStrategy: {
          ttl: 30,
          swr: 60
        }
      }),
      chats: prisma.chat.count({
        where: {
          messages: {
            some: {}
          }
        },
        // @ts-expect-error - This isn't typed yet
        cacheStrategy: {
          ttl: 43200, // 12 hours
          swr: 60
        }
      })
    }
  };
}) as PageServerLoad;
