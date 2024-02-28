import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return {
    user: locals.user,
    streamed: {
      chats: prisma.chat.findMany({
        where: {
          OR: [
            {
              user1_id: {
                equals: locals.user!.id
              }
            },
            {
              user2_id: {
                equals: locals.user!.id
              }
            }
          ],
          messages: {
            some: {}
          }
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              avatar: true,
              loggedInAt: true
            }
          },
          user2: {
            select: {
              id: true,
              username: true,
              avatar: true,
              loggedInAt: true
            }
          },
          _count: {
            select: {
              messages: true
            }
          }
        }
      })
    }
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  deleteChat: async ({ locals, request }) => {
    const data = await request.formData();
    const chatid = data.get("chatId");
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatid?.toString(),
        AND: [
          {
            OR: [
              {
                user1_id: {
                  equals: locals.user!.id
                }
              },
              {
                user2_id: {
                  equals: locals.user!.id
                }
              }
            ]
          }
        ]
      }
    });
    if (!chat) {
      console.info("no chat");
      return {
        status: 200,
        body: {
          success: false
        }
      };
    }
    try {
      await prisma.chat.delete({
        where: {
          id: chat.id,
          AND: [
            {
              OR: [
                {
                  user1_id: {
                    equals: locals.user!.id
                  }
                },
                {
                  user2_id: {
                    equals: locals.user!.id
                  }
                }
              ]
            }
          ]
        }
      });
    } catch (error) {
      console.error(error);
      return {
        status: 200,
        body: {
          success: false
        }
      };
    }

    return {
      status: 200,
      body: {
        success: true
      }
    };
  }
};
