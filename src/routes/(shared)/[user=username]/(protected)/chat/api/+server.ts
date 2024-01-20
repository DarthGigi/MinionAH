import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params, locals, request, url }) => {
  if (request.headers.get("X-Requested-With") !== "fetch") {
    redirect(302, url.href.replace("/api", ""));
  }

  const user = locals.user;

  if (!user) {
    console.info("no user");
    redirect(302, "/login");
  }

  const username = params.user;

  const user2 = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user2) {
    console.info("no user2");
    redirect(302, "/");
  }

  if (user.id === user2?.id) {
    redirect(302, `/${user.username}`);
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
    return new Response(JSON.stringify([]), {
      headers: {
        "content-type": "application/json"
      }
    });
  }

  await prisma.chat.update({
    where: {
      id: chat.id
    },
    data: {
      user1Read: user.id === chat.user1_id ? true : chat.user1Read,
      user2Read: user.id === chat.user2_id ? true : chat.user2Read
    }
  });

  const messages = await prisma.message.findMany({
    where: {
      chat_id: {
        equals: chat.id
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return new Response(JSON.stringify(messages), {
    headers: {
      "content-type": "application/json"
    }
  });
};

export const POST: RequestHandler = async ({ locals, request, params, url }) => {
  if (request.headers.get("X-Requested-With") !== "fetch") {
    redirect(302, url.href.replace("/api", ""));
  }
  const user = locals.user;

  if (!user) {
    console.info("no user");
    redirect(302, "/login");
  }

  const body = await request.json();

  // max message size
  if (body.content.toString().length > 1000) {
    throw new Response("Message exceeds max 1000 characters", {
      status: 413,
      statusText: "Message exceeds max 1000 characters"
    });
  }

  const username = params.user;

  const user2 = await prisma.user.findUnique({
    where: {
      username
    }
  });

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

  let newChat;
  if (!chat) {
    newChat = await prisma.chat.create({
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
        },
        user1Read: true,
        user2Read: false
      }
    });
  }

  chat = newChat ?? chat;

  if (!chat) {
    throw new Error("Chat not found");
  }

  const message = await prisma.message.create({
    data: {
      chat_id: chat.id,
      content: body.content as string,
      user_id: user.id
    }
  });

  // set the other user's read status to false
  await prisma.chat.update({
    where: {
      id: chat.id
    },
    data: {
      user1Read: user.id === chat.user1_id ? chat.user1Read : false,
      user2Read: user.id === chat.user2_id ? chat.user2Read : false
    }
  });

  return new Response(JSON.stringify(message), {
    status: 201,
    statusText: newChat ? "Created" : "OK",
    headers: {
      "content-type": "application/json",
      "x-created-chat": newChat ? "true" : "false"
    }
  });
};
