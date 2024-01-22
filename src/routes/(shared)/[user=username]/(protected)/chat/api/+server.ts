import { INSTANCE_ID, SECRET_KEY, app_id, secret } from "$env/static/private";
import { PUBLIC_cluster, PUBLIC_key } from "$env/static/public";
import PushNotifications from "@pusher/push-notifications-server";
import { redirect } from "@sveltejs/kit";
import Pusher from "pusher";
import type { RequestHandler } from "./$types";

const beamsClient = new PushNotifications({
  instanceId: INSTANCE_ID,
  secretKey: SECRET_KEY
});

const pusher = new Pusher({
  appId: app_id,
  key: PUBLIC_key,
  secret: secret,
  cluster: PUBLIC_cluster,
  useTLS: true
});

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
    throw new Error("Chat not found");
  }

  interface Message {
    id?: string;
    chat_id: string;
    user_id: string;
    content: string;
    createdAt: Date;
  }

  pusher
    .trigger(`chat-${chat.id}`, "new-message", {
      chat_id: chat.id,
      user_id: user.id,
      content: body.content as string,
      createdAt: body.createdAt
    } as Message)
    .then(async (res) => {
      if (res.status === 200) {
        await prisma.message.create({
          data: {
            chat_id: chat.id,
            content: body.content as string,
            user_id: user.id
          }
        });

        await prisma.chat.update({
          where: {
            id: chat.id
          },
          data: {
            user1Read: user.id === chat.user1_id ? chat.user1Read : false,
            user2Read: user.id === chat.user2_id ? chat.user2Read : false
          }
        });
      }
    })
    .catch((err) => {
      console.error(err);
      switch (err.statusCode) {
        case 400:
          return new Response(err.body, {
            status: 400,
            statusText: "Bad Request"
          });
        case 401:
          return new Response(err.body, {
            status: 401,
            statusText: "Unauthorized"
          });
        case 403:
          return new Response(err.body, {
            status: 403,
            statusText: "Forbidden"
          });
        default:
          return new Response(err.body, {
            status: 500,
            statusText: "Internal Server Error"
          });
      }
    });

  // send notification to the other user
  await beamsClient.publishToUsers([chat.user1_id === user.id ? chat.user2_id : chat.user1_id], {
    web: {
      notification: {
        title: `${user.username} sent you a message`,
        body: body.content as string,
        deep_link: `https://chat.svelte.dev/${user.username}`
      }
    }
  });

  return new Response(JSON.stringify({}), {
    status: 201,
    statusText: "Created",
    headers: {
      "content-type": "application/json"
    }
  });
};

export const PUT: RequestHandler = async ({ params, locals, request, url }) => {
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
    throw new Error("Chat not found");
  }

  let updatedChat;
  if ((user.id === chat.user1_id && !chat.user1Read) || (user.id === chat.user2_id && !chat.user2Read)) {
    updatedChat = await prisma.chat.update({
      where: {
        id: chat.id
      },
      data: {
        user1Read: user.id === chat.user1_id ? true : chat.user1Read,
        user2Read: user.id === chat.user2_id ? true : chat.user2Read
      }
    });

    if (!updatedChat) {
      throw new Error("Chat not found");
    }
  }

  return new Response(JSON.stringify({}), {
    status: 200,
    statusText: "No Content",
    headers: {
      "content-type": "application/json"
    }
  });
};
