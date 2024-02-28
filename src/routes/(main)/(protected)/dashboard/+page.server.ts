import type { PageServerLoad } from "./$types";

const MAX_ITEMS = 5;

export const load = (async ({ locals }) => {
  const [usercount, users, auctioncount, auctions, minions, chats] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: {
        loggedInAt: "desc"
      },
      where: {
        id: {
          not: locals.user.id
        }
      },
      take: MAX_ITEMS
    }),
    prisma.minionSeller.count(),
    prisma.minionSeller.findMany({
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
