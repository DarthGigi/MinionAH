import type { PageServerLoad } from "./$types";
import type { Seller } from "$lib/types";

export const load = (async ({ locals }) => {
  const session = await locals.auth.validate();

  let unreadChats;
  let user;

  if (session) {
    user = await prisma.user.findUnique({
      where: {
        id: session.user.userId
      }
    });

    if (!user) {
      return;
    }

    unreadChats = prisma.chat.findFirst({
      where: {
        AND: [
          {
            OR: [
              {
                user1_id: {
                  equals: user.id
                }
              },
              {
                user2_id: {
                  equals: user.id
                }
              }
            ]
          },
          {
            OR: [
              {
                user1Read: {
                  equals: false
                }
              },
              {
                user2Read: {
                  equals: false
                }
              }
            ]
          }
        ]
      },
      select: {
        user1_id: true,
        user2_id: true,
        user1Read: true,
        user2Read: true
      }
    });
  }

  return {
    props: {
      minions: prisma.minionSeller.findMany({
        take: 18,
        skip: 0,
        orderBy: [
          {
            timeCreated: "desc"
          },
          {
            price: "asc"
          }
        ],
        include: {
          minion: true,
          user: {
            select: {
              accent_color: true,
              avatar: true,
              banner: true,
              id: true,
              locale: true,
              loggedInAt: true,
              username: true
            }
          }
        }
      }) as Promise<Seller[]>,
      user,
      unreadChats
    }
  };
}) as PageServerLoad;
