import { auth, discordAuth } from "$lib/server/lucia";
import { redirect } from "@sveltejs/kit";

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  // get code and state params from url
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // if no code or state, redirect to login
  if (!code || !state) {
    console.log("no code or state");
    throw redirect(302, "/login");
  }

  // get stored state from cookies
  const storedState = cookies.get("discord_oauth_state");

  // validate state
  if (!state || !storedState || state !== storedState) {
    console.log("invalid state");
    throw new Response(null, { status: 401 });
  }

  try {
    const { existingUser, providerUser, createUser } = await discordAuth.validateCallback(code);

    const getUser = async () => {
      if (existingUser) return existingUser;
      // create a new user if the user does not exist
      return await createUser({
        id: providerUser.id,
        username: providerUser.username,
        avatar: providerUser.avatar,
        banner: providerUser.banner,
        accent_color: providerUser.accent_color,
        locale: providerUser.locale
      });
    };
    const user = await getUser();

    const session = await auth.createSession(user.userId);

    locals.auth.setSession(session);
  } catch (e) {
    console.log(e);
    return new Response("Internal Server Error", {
      status: 500
    });
  }
  throw redirect(302, "/profile");
};
