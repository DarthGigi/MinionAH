import { dev } from "$app/environment";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI } from "$env/static/private";
import { redirect, type RequestHandler } from "@sveltejs/kit";
import { Discord, generateCodeVerifier, generateState } from "arctic";

const discord = new Discord(DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, dev ? "http://localhost:5173/api/oauth/discord/callback" : DISCORD_REDIRECT_URI);

const state = generateState();
const url = discord.createAuthorizationURL(state, {
  scopes: ["identify"]
});
const codeVerifier = generateCodeVerifier();

export const GET: RequestHandler = async ({ cookies }) => {
  // the state can be stored in cookies or localstorage for request validation on callback
  cookies.set("discord_code_verifier", codeVerifier, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  cookies.set("discord_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60
  });

  // redirect to authorization url
  redirect(302, await url);
};
