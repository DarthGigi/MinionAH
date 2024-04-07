import { FIREBASE_SERVICE_ACCOUNT_KEY, app_id, secret } from "$env/static/private";
import { PUBLIC_cluster, PUBLIC_key } from "$env/static/public";
import { sanitize } from "@jill64/universal-sanitizer";
import { json, redirect } from "@sveltejs/kit";
import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";
import Pusher from "pusher";
import type { RequestHandler } from "./$types";

const firebaseApp =
  getApps().length === 0
    ? initializeApp(
        {
          credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY))
        },
        "admin"
      )
    : getApp("admin");

const messaging = getMessaging(firebaseApp);

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
    redirect(302, "/login");
  }

  const username = params.user;

  const user2 = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (!user2) {
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
    return json([]);
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
    }
    // orderBy: {
    //   createdAt: "desc"
    // }
  });

  return json(messages);
};

export const POST: RequestHandler = async ({ locals, request, params, url }) => {
  if (request.headers.get("X-Requested-With") !== "fetch") {
    redirect(302, url.href.replace("/api", ""));
  }
  const user = locals.user;

  if (!user) {
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
    },
    include: {
      settings: {
        include: {
          notificationSettings: true
        }
      }
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
    try {
      chat = await prisma.chat.create({
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
      if (!chat) {
        throw new Error("Chat not found");
      }
    } catch (error) {
      console.error(error);
      return new Response(null, { status: 500 });
    }
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
            chat_id: chat!.id,
            content: body.content as string,
            user_id: user.id
          }
        });

        await prisma.chat.update({
          where: {
            id: chat!.id
          },
          data: {
            user1Read: user.id === chat!.user1_id ? chat!.user1Read : false,
            user2Read: user.id === chat!.user2_id ? chat!.user2Read : false
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

  /// get the notification settings of the other user
  const notificationSettings =
    user.id === chat.user1_id
      ? user2?.settings?.notificationSettings
      : await prisma.notificationSettings.findFirst({
          where: {
            userSettings: {
              user_id: chat.user1_id
            }
          }
        });

  if (notificationSettings?.notificationType === "ALL" || notificationSettings?.notificationType === "DEVICE") {
    if (notificationSettings.socialNotifications) {
      if (notificationSettings.fcmTokens.length > 0) {
        const message: MulticastMessage = {
          notification: {
            title: `${user.username} sent you a message`,
            body: sanitize(body.content, {
              sanitizeHtml: {
                allowedTags: [],
                disallowedTagsMode: "discard"
              }
            }),
            imageUrl: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`
          },
          data: {
            chat_id: chat.id,
            user_id: user.id,
            username: user.username
          },
          tokens: notificationSettings.fcmTokens,
          webpush: {
            fcmOptions: {
              link: `https://minionah.com/${user.username}/chat`
            },
            notification: {
              icon: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`,
              image: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${user.id}`,
              tag: `chat-${chat.id}`,
              renotify: true
            }
          }
        };

        messaging.sendEachForMulticast(message).catch((error) => {
          console.error("Error sending message:", error);
        });
      }
    }
  }

  return json({}, { status: 201, statusText: "Created" });
};

export const PUT: RequestHandler = async ({ params, locals, request, url }) => {
  if (request.headers.get("X-Requested-With") !== "fetch") {
    redirect(302, url.href.replace("/api", ""));
  }

  const user = locals.user;

  if (!user) {
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

  return json({}, { status: 200, statusText: "No Content" });
};
