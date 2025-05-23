import prisma from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { formSchemaBump, formSchemaCreate, formSchemaDelete } from "./schema";

export const load = (async ({ locals }) => {
  return {
    formCreate: await superValidate(zod(formSchemaCreate), { id: "formCreate" }),
    formDelete: await superValidate(zod(formSchemaDelete), { id: "formDelete" }),
    formBump: await superValidate(zod(formSchemaBump), { id: "formBump" }),
    minionTypes: prisma.minion.findMany({
      select: {
        id: true,
        generator: true,
        maxTier: true
      },
      distinct: ["generator"],
      orderBy: {
        generator: "asc"
      }
    }),
    userMinions: prisma.auction.findMany({
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
  };
}) satisfies PageServerLoad;

export const actions = {
  createMinion: async ({ locals, request }) => {
    const user = locals.user;

    const formCreate = await superValidate(request, zod(formSchemaCreate), { id: "formCreate" });

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
      const createdMinion = await prisma.auction.create({
        data: {
          amount: formCreate.data.amount,
          price: Number(formCreate.data.price),
          hasInfusion: formCreate.data.infusion,
          hasFreeWill: formCreate.data["free-will"],
          isNegotiable: formCreate.data.negotiable,
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
    const formDelete = await superValidate(request, zod(formSchemaDelete), { id: "formDelete" });

    if (!formDelete.valid) {
      return fail(400, {
        formDelete
      });
    }

    const minionId = formDelete.data.id as string;

    try {
      const deletedMinion = await prisma.auction.delete({
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
  },
  bumpMinion: async ({ locals, request }) => {
    const formBump = await superValidate(request, zod(formSchemaBump), { id: "formBump" });

    if (!formBump.valid) {
      return fail(400, {
        formBump
      });
    }

    const minionId = formBump.data.id as string;

    try {
      const minion = await prisma.auction.findUnique({
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

      if (!minion) {
        throw new Error("Minion not found");
      }

      // if the minion has been bumped in the last 72 hours, don't allow bumping
      const timeBumped = minion.timeBumped || new Date(0);
      const timeNow = new Date();
      const timeDiff = timeNow.getTime() - timeBumped.getTime();
      const maxTimeDiff = 72 * 60 * 60 * 1000;

      if (timeDiff < maxTimeDiff) {
        return message(formBump, { title: "Your minion can't be bumped yet.", description: "You can only bump your minion once every 72 hours." }, { status: 400 });
      }

      const updatedMinion = await prisma.auction.update({
        where: {
          id: minionId,
          AND: [
            {
              user: {
                id: locals.user!.id
              }
            }
          ]
        },
        data: {
          timeBumped: timeNow,
          timeCreated: minion.timeCreated
        }
      });

      if (!updatedMinion) {
        throw new Error("Something went wrong");
      }

      return message(formBump, { title: "Your minion has been bumped!", description: "Your minion has successfully been bumped on the auction house." });
    } catch (e) {
      console.error(e);
      return message(formBump, { title: "Unable to bump your minion.", description: "We couldn't bump your minion. Please try again. <br/>If this issue keeps happening, please contact us." }, { status: 400 });
    }
  }
} satisfies Actions;
