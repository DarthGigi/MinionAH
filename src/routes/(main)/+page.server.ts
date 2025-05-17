import type { Seller } from "$lib/types";
import type { PageServerLoad } from "./$types";

type PillData = {
  hidden: boolean;
  url: string;
  text: string;
  icon?: string;
  type: string;
  external: boolean;
};

export const load = (async ({ fetch }) => {
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
    },
    pillData: fetch("https://gist.githubusercontent.com/DarthGigi/d6ab08dfb4f479dbb0f5e0999c01e2bc/raw/pilldata.json").then((res) => res.json()) as Promise<PillData>
  };
}) as PageServerLoad;
