import { dev } from "$app/environment";
import { MC_AUTH_CLIENT_ID, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { generateCodeVerifier, generateState } from "arctic";

const state = generateState();
const codeVerifier = generateCodeVerifier();

const url = new URL("https://mc-auth.com/oAuth2/authorize");
const params = {
  response_type: "code",
  client_id: MC_AUTH_CLIENT_ID,
  state: state,
  scope: "profile",
  redirect_uri: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI,
  code_challenge: codeVerifier,
  code_challenge_method: "S256"
};

Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

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
