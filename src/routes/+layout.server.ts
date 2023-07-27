import type { LayoutServerLoad } from "./$types";

import prisma from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {
  const session = await locals.auth.validate();

  if (url.pathname === "/profile" && !session) {
    throw redirect(302, "/login");
  }

  if (url.pathname === "/login" && session) {
    throw redirect(302, "/profile");
  }

  if (!session) {
    return {
      user: null
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.userId
    }
  });

  if (!user) {
    throw redirect(302, "/login");
  }

  return {
    user
  };
}) satisfies LayoutServerLoad;
