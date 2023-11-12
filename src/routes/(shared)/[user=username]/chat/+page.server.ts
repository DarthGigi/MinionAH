import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ params, locals }) => {
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
  const username = params.user;

  const user2 = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user2) {
    console.log("no user2");
    throw redirect(302, "/");
  }

  if (user.id === user2?.id) {
    console.log("same user");
    throw redirect(302, `/${user.username}`);
  }

  const chat = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          user1_id: {
            equals: user.id
          },
          user2_id: {
            equals: user2?.id
          }
        },
        {
          user1_id: {
            equals: user2?.id
          },
          user2_id: {
            equals: user.id
          }
        }
      ]
    }
  });

  if (!chat) {
    return { chat, user, user2 };
  }

  return {
    chat,
    user,
    user2,
    streamed: {
      messages: prisma.message.findMany({
        where: {
          chat_id: {
            equals: chat.id
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      })
    }
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request, params }) => {
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

    const username = params.user;

    const user2 = await prisma.user.findUnique({
      where: {
        username
      }
    });

    console.log(user);
    console.log(user2);

    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            user1_id: {
              equals: user.id
            },
            user2_id: {
              equals: user2?.id
            }
          },
          {
            user1_id: {
              equals: user2?.id
            },
            user2_id: {
              equals: user.id
            }
          }
        ]
      }
    });

    if (!chat) {
      console.log("creating chat");
      await prisma.chat.create({
        data: {
          user1: {
            connect: {
              id: user.id
            }
          },
          user2: {
            connect: {
              id: user2?.id
            }
          }
        }
      });
    }

    chat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            user1_id: {
              equals: user.id
            },
            user2_id: {
              equals: user2?.id
            }
          },
          {
            user1_id: {
              equals: user2?.id
            },
            user2_id: {
              equals: user.id
            }
          }
        ]
      }
    });

    console.log(chat);

    if (!chat) {
      throw new Error("Chat not found");
    }

    const data = await request.formData();

    console.log(data);

    const body = Object.fromEntries(data.entries());

    console.log(body);

    const message = await prisma.message.create({
      data: {
        chat_id: chat.id,
        content: body.message as string,
        user_id: user.id
      }
    });

    return {
      body: {
        message
      }
    };
  }
};
