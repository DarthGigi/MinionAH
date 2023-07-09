import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { prisma } from "$lib/server/prisma";

export const load = (async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw redirect(302, "/login");
  }

  // Load user profile data from database
  const user = await prisma.authUser.findUnique({
    where: {
      id: session.id
    }
  });

  if (!user) {
    throw redirect(302, "/login");
  }

  return {
    user
  };
}) satisfies PageServerLoad;
