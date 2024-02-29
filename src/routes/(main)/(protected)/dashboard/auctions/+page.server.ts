import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const [auctions] = await Promise.all([
    prisma.auction.findMany({
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
