import { dev } from "$app/environment";
import { AD_CLIENT_ID, AD_REDIRECT_URI } from "$env/static/private";
import { createOAuth2AuthorizationUrlWithPKCE } from "@lucia-auth/oauth";
import { redirect, type RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies }) => {
  // get url to redirect the user to, with the state
  const [url, codeVerifier, state] = await createOAuth2AuthorizationUrlWithPKCE("https://login.live.com/oauth20_authorize.srf", {
    clientId: AD_CLIENT_ID,
    redirectUri: dev ? "http://localhost:5173/api/oauth/microsoft" : AD_REDIRECT_URI,
    scope: ["XboxLive.signin"],
    codeChallengeMethod: "S256"
  });

  // the state can be stored in cookies or localstorage for request validation on callback
  cookies.set("microsoft_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  cookies.set("microsoft_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  // redirect to authorization url
  throw redirect(302, url.href);
};
