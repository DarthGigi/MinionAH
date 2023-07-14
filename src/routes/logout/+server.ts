import type { RequestHandler } from "./$types";
import { redirect } from "@sveltejs/kit";
import { auth } from "$lib/server/lucia";

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw redirect(302, "/login");
  }

  let response = await auth.invalidateSession(session.sessionId);
  console.log(response);

  return new Response();
  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        Location: "/"
      }
    }
  );
};
