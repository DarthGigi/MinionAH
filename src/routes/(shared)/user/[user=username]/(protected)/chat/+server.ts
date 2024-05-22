import { json, redirect } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ locals, params }) => {
  const user = locals.user;

  if (!user) {
    redirect(302, "/login");
  }

  try {
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
      return json({ success: true, message: "Chat not found" }, { status: 404 });
    }

    let unreadChats: number = 0;
    if ((user.id === chat.user1_id && !chat.user1Read) || (user.id === chat.user2_id && !chat.user2Read)) {
      const updatedChat = await prisma.chat.update({
        where: {
          id: chat.id
        },
        data: {
          user1Read: user.id === chat.user1_id ? true : chat.user1Read,
          user2Read: user.id === chat.user2_id ? true : chat.user2Read
        }
      });

      unreadChats = await prisma.chat.count({
        where: {
          OR: [
            {
              user1_id: {
                equals: user.id
              },
              user1Read: {
                equals: false
              }
            },
            {
              user2_id: {
                equals: user.id
              },
              user2Read: {
                equals: false
              }
            }
          ]
        }
      });

      if (!updatedChat) {
        return json({ success: false, message: "Internal Server Error" }, { status: 500 });
      }
    }

    return json({ success: true, unread: unreadChats }, { status: 200 });
  } catch (error) {
    console.error(error);
    return json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
};
