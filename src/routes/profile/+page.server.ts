import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { randomUUID } from "crypto";

export const load = (async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw redirect(302, "/login");
  }

  // Load user profile data from database
  const user = await prisma.authUser.findUnique({
    where: {
      id: session.userId
    }
  });

  if (!user) {
    throw redirect(302, "/login");
  }

  // Load all generator types, only 1 minion per type
  const minionTypes = await prisma.minion.findMany({
    select: {
      generator: true,
      texture: true
    },
    distinct: ["generator"],
    orderBy: {
      generator: "asc"
    }
  });

  return {
    user,
    streamed: {
      minionTypes
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  createMinion: async ({ locals, request }) => {
    const session = await locals.auth.validate();
    if (!session) {
      throw redirect(302, "/login");
    }

    let user;
    try {
      user = await prisma.authUser.findUnique({
        where: {
          id: session.userId
        }
      });

      console.log("User: ", user);
      if (!user) {
        throw redirect(302, "/login");
      }
    } catch (e) {
      console.error(e);
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const minionType = formData.get("minionType") as string;
    const amount = formData.get("amount") as unknown as number;
    const price = formData.get("price") as string;
    const tier = formData.get("tier") as unknown as number;

    const priceNumber = parseFloat(price.replace(/,/g, ".").replace(/[^\d.-]/g, "")) * (price.endsWith("k") ? 1000 : price.endsWith("m") ? 1000000 : 1);

    let minion;
    try {
      minion = await prisma.minion.findFirst({
        // where generator is minionType and tier is tier
        where: {
          generator: minionType,
          AND: [
            {
              generator_tier: Number(tier)
            }
          ]
        }
      });

      console.log("Minion: ", minion);

      if (!minion) {
        throw new Error("Minion not found");
      }
    } catch (e) {
      console.error(e);
      return {
        status: 400,
        body: {
          error: "Minion not found"
        }
      };
    }

    // create the minion in the database
    try {
      console.log("Minion id: ", minion.id);
      const createdMinion = await prisma.minionSeller.create({
        data: {
          id: randomUUID(),

          amount: Number(amount),
          price: Number(priceNumber),
          minion: {
            connect: {
              id: minion.id
            }
          },
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });

      console.log("Created minion: ", createdMinion);

      return {
        status: 200,
        body: {
          success: true
        }
      };
    } catch (e) {
      console.error(e);
      return {
        status: 400,
        body: {
          error: "Something went wrong"
        }
      };
    }
  }
} satisfies Actions;
