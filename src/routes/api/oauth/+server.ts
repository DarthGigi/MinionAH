import { microsoftAuth } from "$lib/server/lucia";

import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  // get url to redirect the user to, with the state
  const [url, codeVerifier, state] = await microsoftAuth.getAuthorizationUrl();

  // the state can be stored in cookies or localstorage for request validation on callback
  cookies.set("microsoft_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  cookies.set("microsoft_oauth_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  // redirect to authorization url
  throw redirect(302, url.toString());
};
