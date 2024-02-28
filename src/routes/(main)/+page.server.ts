import type { Seller } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (locals.maintenance) return;

  return {
    minions: prisma.minionSeller.findMany({
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
            avatar: true,
            id: true,
            loggedInAt: true,
            username: true,
            skin: true
          }
        }
      }
    }) as Promise<Seller[]>
  };
}) as PageServerLoad;
