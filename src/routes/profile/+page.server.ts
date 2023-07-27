import type { PageServerLoad, Actions } from "./$types";
import { redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";

import type { Seller } from "$lib/types";

export const load = (async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw redirect(302, "/login");
  }

  // Load user profile data from database

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId
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
      minionTypes,
      userMinions: prisma.minionSeller.findMany({
        where: {
          user: {
            id: user.id
          }
        },
        include: {
          minion: true,
          user: true
        },
        orderBy: {
          timeCreated: "desc"
        }
      }) as Promise<Seller[]>
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
      user = await prisma.user.findUnique({
        where: {
          id: session.user.userId
        }
      });

      if (!user) {
        throw redirect(302, "/login");
      }
    } catch (e) {
      console.error(e);
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const minionType = formData.get("minionType") as string;
    const amount = Number(formData.get("amount")) as number;
    const price = Number(formData.get("price")) as number;
    const tier = Number(formData.get("tier")) as number;

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
      return {
        status: 400,
        body: {
          error: "Minion not found"
        }
      };
    }

    // create the minion in the database
    try {
      const createdMinion = await prisma.minionSeller.create({
        data: {
          amount,
          price,
          user: {
            connect: {
              id: user.id
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

      return {
        status: 200,
        body: {
          success: true,
          message: "Your minion has successfully been created!"
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
  },
  deleteMinion: async ({ locals, request }) => {
    const session = await locals.auth.validate();
    if (!session) {
      throw redirect(302, "/login");
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          id: session.user.userId
        }
      });

      if (!user) {
        throw redirect(302, "/login");
      }
    } catch (e) {
      console.error(e);
      throw redirect(302, "/login");
    }

    const formData = await request.formData();
    const minionId = formData.get("minion") as string;

    try {
      const deletedMinion = await prisma.minionSeller.delete({
        where: {
          id: minionId
        }
      });

      if (!deletedMinion) {
        throw new Error("Something went wrong");
      }

      return {
        status: 200,
        body: {
          success: true,
          message: "Your minion has successfully been deleted!"
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
