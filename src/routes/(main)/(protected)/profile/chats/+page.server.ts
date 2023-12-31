import type { PageServerLoad, Actions } from "./$types";

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
          ]
        },
        include: {
          user1: {
            select: {
              username: true,
              avatar: true
            }
          },
          user2: {
            select: {
              username: true,
              avatar: true
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
        id: {
          equals: chatid?.toString()
        }
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
      await prisma.message.deleteMany({
        where: {
          chat_id: chat.id
        }
      });

      await prisma.chat.delete({
        where: {
          id: chat.id
        }
      });
    } catch (error) {
      console.info(error);
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
