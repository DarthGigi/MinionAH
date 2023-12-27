import { dev } from "$app/environment";
import { MC_AUTH_CLIENT_ID, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { createOAuth2AuthorizationUrlWithPKCE } from "@lucia-auth/oauth";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  // get url to redirect the user to, with the state
  const [url, codeVerifier, state] = await createOAuth2AuthorizationUrlWithPKCE("https://mc-auth.com/oAuth2/authorize", {
    clientId: MC_AUTH_CLIENT_ID,
    redirectUri: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI,
    scope: ["profile"],
    codeChallengeMethod: "S256"
  });

  // the state can be stored in cookies or localstorage for request validation on callback
  cookies.set("minecraft_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  cookies.set("minecraft_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  // redirect to authorization url
  redirect(302, url.href);
};
