import { discordAuth } from "$lib/server/lucia";

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  // get url to redirect the user to, with the state
  const [url, state] = await discordAuth.getAuthorizationUrl();

  // the state can be stored in cookies or localstorage for request validation on callback
  cookies.set("discord_oauth_state", state, {
    path: "/",
    maxAge: 60 * 60
  });

  // redirect to authorization url
  return new Response(null, {
    status: 302,
    headers: {
      location: url.toString()
    }
  });
};
