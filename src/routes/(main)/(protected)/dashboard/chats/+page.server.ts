import type { PageServerLoad } from "./$types";

export const load = (async () => {
  const [chats] = await Promise.all([
    prisma.chat.findMany({
      where: {
        messages: {
          some: {}
        }
      },
      include: {
        user1: true,
        user2: true,
        _count: {
          select: {
            messages: true
          }
        }
      }
    })
  ]);
  return {
    chats
  };
}) satisfies PageServerLoad;
