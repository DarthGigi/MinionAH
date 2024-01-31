import type { PageServerLoad } from "./$types";

const MAX_USERS = 5;

export const load = (async ({ locals }) => {
  const [usercount, users, auctions, minions, chats] = await Promise.all([
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
      take: MAX_USERS
    }),
    prisma.minionSeller.count(),
    prisma.minion.count(),
    prisma.chat.count()
  ]);

  return {
    usercount,
    users,
    auctions,
    minions,
    chats
  };
}) satisfies PageServerLoad;
