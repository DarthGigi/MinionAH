import { auth, discordAuth } from "$lib/server/lucia";
import { redirect } from "@sveltejs/kit";
import { OAuthRequestError } from "@lucia-auth/oauth";

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  // get stored state from cookies
  const storedState = cookies.get("discord_oauth_state");
  // get code and state params from url

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // if no code or state, redirect to login
  if (!storedState || !state || storedState !== state || !code) {
    console.info("no code or state");
    throw redirect(302, "/login");
  }

  try {
    const { getExistingUser, discordUser, createUser } = await discordAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      // create a new user if the user does not exist
      const user = await createUser({
        userId: discordUser.id,
        attributes: {
          id: discordUser.id,
          username: discordUser.username,
          avatar: discordUser.avatar ?? "",
          banner: discordUser.banner ?? "",
          accent_color: discordUser.accent_color ?? undefined,
          locale: discordUser.locale ?? ""
        }
      });

      return user;
    };
    const user = await getUser();

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {}
    });

    locals.auth.setSession(session);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/profile"
      }
    });
  } catch (e) {
    console.error(e);
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400
      });
    }
    return new Response("Internal Server Error", {
      status: 500
    });
  }
};
