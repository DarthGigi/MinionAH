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
    }) as Promise<Seller[]>
  };
}) as PageServerLoad;
