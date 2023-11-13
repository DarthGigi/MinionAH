import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    console.log("no session");
    throw redirect(302, "/login");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId
    }
  });

  if (!user) {
    console.log("no user");
    throw redirect(302, "/login");
  }

  return {
    user,
    streamed: {
      chats: prisma.chat.findMany({
        where: {
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
    const session = await locals.auth.validate();
    if (!session) {
      throw redirect(302, "/login");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.userId
      }
    });
    if (!user) {
      throw redirect(302, "/login");
    }

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
      console.log("no chat");
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
      console.log(error);
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
