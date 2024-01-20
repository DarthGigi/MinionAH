import { auth } from "$lib/server/lucia";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  await auth.invalidateSession(locals.session!.sessionId);
  locals.auth.setSession(null);

  cookies.delete("auth_session", { path: "/" });

  // redirect to home page
  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });
};
