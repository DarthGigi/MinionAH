import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const [auctions] = await Promise.all([
    prisma.minionSeller.findMany({
      include: {
        user: true,
        minion: true
      }
    })
  ]);
  return {
    auctions
  };
}) satisfies PageServerLoad;
