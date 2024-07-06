import type { PageServerLoad } from "./$types";

export const load = (async () => {
  return {
    minions: prisma.minion.findMany()
  };
}) satisfies PageServerLoad;
