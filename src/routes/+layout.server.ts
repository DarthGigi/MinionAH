import type { LayoutServerLoad } from "./$types";

import prisma from "$lib/server/prisma";
import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals, url }) => {
  const path = url.pathname;

  if ((path === "/login" || path === "/signup") && (locals.session || locals.user)) {
    throw redirect(302, "/profile");
  }

  if (locals.isProtectedRoute && (!locals.session || !locals.user)) {
    throw redirect(302, "/login");
  }

  if (path === "/signup/password" && locals.session) {
    if (!locals.user) throw redirect(302, "/login");
    const userKey = await prisma.key.findFirst({
      where: {
        id: "username:" + locals.user.username.toLocaleLowerCase()
      }
    });

    if (userKey && userKey.hashed_password) {
      throw redirect(302, "/profile");
    }
  }

  return {
    [locals.user !== null ? "user" : ""]: locals.user
  };
}) satisfies LayoutServerLoad;
