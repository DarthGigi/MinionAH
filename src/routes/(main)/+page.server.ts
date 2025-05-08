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
      }
    }),
    users: prisma.user.findMany({
      select: {
        id: true,
        username: true
      },
      orderBy: {
        loggedInAt: "desc"
      }
    }),
    stats: {
      users: prisma.user.count(),
      auctions: prisma.auction.count(),
      chats: prisma.chat.count({
        where: {
          messages: {
            some: {}
          }
        }
      })
    }
  };
}) as PageServerLoad;
