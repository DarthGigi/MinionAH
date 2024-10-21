import { invalidateSession } from "$lib/server/lucia/auth";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  await invalidateSession(locals.session!.id);
  locals.user = null;
  locals.session = null;

  cookies.delete("auth_session", { path: "/" });

  // redirect to home page
  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });
};
