import { dev } from "$app/environment";
import { MC_AUTH_CLIENT_ID, MC_AUTH_CLIENT_SECRET, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { createSession, generateSessionToken } from "$lib/server/lucia/auth";
import { setSessionTokenCookie } from "$lib/server/lucia/cookies";
import { getMcAuthInfo } from "$lib/server/minecraft";
import { getMcAuthUser } from "$lib/server/signup";
import { TokenRequestResult } from "@oslojs/oauth2";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";

export const GET = (async ({ cookies, locals, fetch, url }) => {
  const params = url.searchParams;
  const code = params.get("code");
  const state = params.get("state");

  // get state cookie we set when we got the authorization url
  const stateCookie = cookies.get("minecraft_oauth_state");
  cookies.delete("minecraft_oauth_state", { path: "/" });

  // validate state
  if (!state || !stateCookie || state !== stateCookie) redirect(302, "/login"); // invalid state

  const codeVerifier = cookies.get("minecraft_code_verifier");
  cookies.delete("minecraft_code_verifier", { path: "/" });

  if (!codeVerifier) redirect(302, "/login"); // invalid code verifier

  try {
    const response = await fetch("https://mc-auth.com/oAuth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: MC_AUTH_CLIENT_ID,
        client_secret: MC_AUTH_CLIENT_SECRET,
        code,
        redirect_uri: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const result = new TokenRequestResult(await response.json());

    if (result.hasErrorCode()) {
      console.error(result.errorCode());
      error(500, "Error getting MC profile");
    }

    const accessToken = result.accessToken();

    const minecraftUser = await getMcAuthInfo(accessToken);

    const user = await getMcAuthUser(minecraftUser);

    if (!user) {
      console.error("Failed to create account");
      error(500, "Failed to create account");
    }

    const token = generateSessionToken();
    const session = await createSession(token, user.id);
    setSessionTokenCookie(cookies, token, session.expiresAt);

    locals.session = session;
  } catch (e) {
    console.error(e);
    error(500, "Internal Server Error");
  }

  redirect(302, "/signup/password");
}) satisfies RequestHandler;
