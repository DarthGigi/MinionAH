import type { Seller } from "$lib/types";
import { superValidate } from "sveltekit-superforms/server";
import type { PageServerLoad } from "./$types";
import { formSchema } from "./schema";

export const load = (async ({ locals }) => {
  if (locals.maintenance) return;
  const session = locals.session;

  let unreadChats;

  if (session) {
    const user = locals.user;

    if (!user) return;

    unreadChats = prisma.chat.findFirst({
      where: {
        AND: [
          {
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
          {
            OR: [
              {
                user1Read: {
                  equals: false
                }
              },
              {
                user2Read: {
                  equals: false
                }
              }
            ]
          }
        ]
      },
      select: {
        user1_id: true,
        user2_id: true,
        user1Read: true,
        user2Read: true
      }
    });
  }

  return {
    streamed: {
      minions: prisma.minionSeller.findMany({
        take: 18,
        skip: 0,
        orderBy: [
          {
            timeCreated: "desc"
          },
          {
            price: "asc"
          }
        ],
        include: {
          minion: true,
          user: {
            select: {
              avatar: true,
              id: true,
              loggedInAt: true,
              username: true,
              skin: true
            }
          }
        }
      }) as Promise<Seller[]>,
      unreadChats,
      form: superValidate(formSchema)
    }
  };
}) as PageServerLoad;
