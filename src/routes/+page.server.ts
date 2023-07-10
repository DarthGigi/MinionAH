import type { PageServerLoad } from "./$types";
import type { Minion } from "$lib/types";

export const load = (async () => {
  return {
    props: {
      minions: prisma.minion.findMany({
        take: 9,
        skip: 0,
        orderBy: [
          {
            generator: "asc"
          },
          {
            generator_tier: "asc"
          }
        ]
      }) as Promise<Minion[]>
    }
  };
}) as PageServerLoad;
