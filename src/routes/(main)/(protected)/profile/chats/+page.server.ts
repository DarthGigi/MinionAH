import { fail, message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { formSchemaDelete } from "../schema";
import type { Actions, PageServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return {
    user: locals.user,
    formDelete: await superValidate(zod(formSchemaDelete), { id: "formDelete" }),
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
              loggedInAt: true
            }
          },
          user2: {
            select: {
              id: true,
              username: true,
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
    const user = locals.user;

    const formDelete = await superValidate(request, zod(formSchemaDelete), { id: "formDelete" });
    if (!formDelete.valid) {
      return fail(400, {
        formDelete
      });
    }

    const chatid = formDelete.data.id;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatid,
        AND: [
          {
            OR: [
              {
                user1_id: {
                  equals: user!.id
                }
              },
              {
                user2_id: {
                  equals: user!.id
                }
              }
            ]
          }
        ]
      }
    });
    if (!chat) {
      return message(formDelete, "Something went wrong. Please try again.", {
        status: 500
      });
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
      return message(formDelete, "Something went wrong. Please try again.", {
        status: 500
      });
    }

    return message(formDelete, "Chat deleted successfully.");
  }
};
