import type { PageServerLoad } from "./$types";
import type { Seller } from "$lib/types";

export const load = (async () => {
  return {
    props: {
      minions: prisma.minionSeller.findMany({
        take: 9,
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
      }) as Promise<Seller[]>
    }
  };
}) as PageServerLoad;
