import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw redirect(302, "/login");
  }

  await auth.invalidateSession(session.sessionId);
  locals.auth.setSession(null);

  // redirect to home page
  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });
};
