import type { PageServerLoad } from "./$types";

const MAX_ITEMS = 5;

export const load = (async ({ locals }) => {
  const [usercount, users, auctioncount, auctions, minions, chats] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc"
      },
      where: {
        id: {
          not: locals.user!.id
        }
      },
      take: MAX_ITEMS
    }),
    prisma.auction.count(),
    prisma.auction.findMany({
      orderBy: {
        timeCreated: "desc"
      },
      include: {
        user: true,
        minion: true
      },
      take: MAX_ITEMS
    }),
    prisma.minion.count(),
    prisma.chat.count({
      where: {
        messages: {
          some: {}
        }
      }
    })
  ]);

  return {
    usercount,
    users,
    auctioncount,
    auctions,
    minions,
    chats
  };
}) satisfies PageServerLoad;
