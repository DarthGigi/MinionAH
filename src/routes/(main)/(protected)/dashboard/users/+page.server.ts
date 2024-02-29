import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const [users] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            auctions: true
          }
        }
      }
    })
  ]);
  return {
    users
  };
}) satisfies PageServerLoad;
