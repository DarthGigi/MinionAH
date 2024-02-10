import { dev } from "$app/environment";
import { MC_AUTH_CLIENT_ID, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { OAuth2Client, generateCodeVerifier, generateState } from "oslo/oauth2";

const provider = new OAuth2Client(MC_AUTH_CLIENT_ID, "https://mc-auth.com/oAuth2/authorize", "https://mc-auth.com/oAuth2/token", {
  redirectURI: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI
});

const state = generateState();
const codeVerifier = generateCodeVerifier();

const url = await provider.createAuthorizationURL({
  state,
  codeVerifier,
  scopes: ["profile"]
});

export const GET: RequestHandler = async ({ cookies }) => {
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
