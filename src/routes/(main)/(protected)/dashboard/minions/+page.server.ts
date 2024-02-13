import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const minions = await prisma.minion.findMany({
    include: {
      _count: {
        select: {
          sellers: true
        }
      }
    }
  });
  return {
    minions
  };
}) satisfies PageServerLoad;
