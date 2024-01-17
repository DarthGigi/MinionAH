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

  if (chat.user1_id === user.id) {
    await prisma.chat.update({
      where: {
        id: chat.id
      },
      data: {
        user1Read: true
      }
    });
  } else {
    await prisma.chat.update({
      where: {
        id: chat.id
      },
      data: {
        user2Read: true
      }
    });
  }

  const messages = await prisma.message.findMany({
    where: {
      chat_id: {
        equals: chat.id
      }
    },
    orderBy: {
      createdAt: "asc"
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

  if (!chat) {
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

  return new Response(JSON.stringify(message), {
    status: 201,
    headers: {
      "content-type": "application/json"
    }
  });
};
