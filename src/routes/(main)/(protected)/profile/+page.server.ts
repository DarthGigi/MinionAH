import prisma from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { formSchemaCreate, formSchemaDelete } from "./schema";

export const load = (async ({ locals }) => {
  return {
    formCreate: await superValidate(formSchemaCreate, { id: "formCreate" }),
    formDelete: await superValidate(formSchemaDelete, { id: "formDelete" }),
    streamed: {
      // Load all generator types, only 1 minion per type
      minionTypes: prisma.minion.findMany({
        select: {
          id: true,
          generator: true,
          texture: true,
          maxTier: true
        },
        distinct: ["generator"],
        orderBy: {
          generator: "asc"
        }
      }),
      userMinions: prisma.minionSeller.findMany({
        where: {
          user: {
            id: locals.user!.id
          }
        },
        include: {
          minion: true,
          user: true
        },
        orderBy: {
          timeCreated: "desc"
        }
      })
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  createMinion: async ({ locals, request }) => {
    const user = locals.user;

    const formCreate = await superValidate(request, formSchemaCreate, { id: "formCreate" });

    if (!formCreate.valid) {
      return fail(400, {
        formCreate
      });
    }

    const minionType = formCreate.data.type as string;
    const tier = Number(formCreate.data.tier) as number;

    let minion;
    try {
      minion = await prisma.minion.findFirst({
        // where generator is minionType and tier is tier
        where: {
          generator: minionType,
          AND: [
            {
              generator_tier: tier
            }
          ]
        }
      });

      if (!minion) {
        throw new Error("Minion not found");
      }
    } catch (e) {
      console.error(e);
      return message(formCreate, { title: "Couldn't find the minion", description: "We couldn't find the minion you selected. Please try again. <br/>If this issue keeps happening, please contact us." }, { status: 400 });
    }

    // create the minion in the database
    try {
      const createdMinion = await prisma.minionSeller.create({
        data: {
          amount: formCreate.data.amount,
          price: Number(formCreate.data.price),
          hasInfusion: formCreate.data.infusion,
          user: {
            connect: {
              id: user!.id
            }
          },
          minion: {
            connect: {
              id: minion.id
            }
          }
        }
      });
      if (!createdMinion) {
        throw new Error("Something went wrong");
      }
      return message(formCreate, { title: "Your minion has been created!", description: "Your minion has successfully been created on the auction house." });
    } catch (e) {
      console.error(e);
      return message(formCreate, { title: "Unable to create your minion.", description: "We couldn't create your minion. Please try again. <br/>If this issue keeps happening, please contact us." }, { status: 400 });
    }
  },
  deleteMinion: async ({ locals, request }) => {
    const formDelete = await superValidate(request, formSchemaDelete, { id: "formDelete" });

    if (!formDelete.valid) {
      return fail(400, {
        formDelete
      });
    }

    const minionId = formDelete.data.id as string;

    try {
      const deletedMinion = await prisma.minionSeller.delete({
        where: {
          id: minionId,
          AND: [
            {
              user: {
                id: locals.user!.id
              }
            }
          ]
        }
      });

      if (!deletedMinion) {
        throw new Error("Something went wrong");
      }

      return message(formDelete, { title: "Your minion has been deleted!", description: "Your minion has successfully been deleted from the auction house." });
    } catch (e) {
      console.error(e);
      return message(formDelete, { title: "Unable to delete your minion.", description: "We couldn't delete your minion. Please try again. <br/>If this issue keeps happening, please contact us." }, { status: 400 });
    }
  }
} satisfies Actions;
