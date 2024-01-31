import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const minionsCount = await prisma.minion.count();
  const [minionsBatch1, minionsBatch2] = await Promise.all([
    prisma.minion.findMany({
      take: minionsCount / 2,
      include: {
        _count: {
          select: {
            sellers: true
          }
        }
      }
    }),
    prisma.minion.findMany({
      skip: minionsCount / 2,
      include: {
        _count: {
          select: {
            sellers: true
          }
        }
      }
    })
  ]);
  return {
    minionsBatch1,
    minionsBatch2
  };
}) satisfies PageServerLoad;
