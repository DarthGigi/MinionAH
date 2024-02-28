import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, locals }) => {
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
          user2Read: true
        }
      });
    } catch (error) {
      console.error(error);
      throw new Error("Chat not found");
    }
  }

  return { chat, user, user2, params };
}) satisfies PageServerLoad;
