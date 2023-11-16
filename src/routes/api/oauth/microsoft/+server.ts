import { auth, microsoftAuth } from "$lib/server/lucia";
import { redirect } from "@sveltejs/kit";
import { OAuthRequestError } from "@lucia-auth/oauth";

import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  // console.log(url.searchParams.toString());
  // get stored state from cookies
  const storedState = cookies.get("microsoft_oauth_state");
  const storedCodeVerifier = cookies.get("microsoft_oauth_code_verifier");
  // get code and state params from url

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // if no code or state, redirect to login
  if (!storedState || !state || storedState !== state || !code || !storedCodeVerifier) {
    console.log("no code or state");
    throw redirect(302, "/login");
  }

  try {
    const { azureADTokens } = await microsoftAuth.validateCallback(code, storedCodeVerifier);

    console.log("azureADTokens: ", azureADTokens);
    return new Response(null, {
      status: 200
    });

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      // create a new user if the user does not exist
      // const user = await createUser({
      //   userId: azureADTokens.,
      //   attributes: {
      //     id: discordUser.id,
      //     username: discordUser.username,
      //     avatar: discordUser.avatar ?? "",
      //     banner: discordUser.banner ?? "",
      //     accent_color: discordUser.accent_color ?? undefined,
      //     locale: discordUser.locale ?? ""
      //   }
      // });

      // return user;
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
    console.log(await e.response.json());
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400
      });
    }
    console.log(e);
    return new Response("Internal Server Error", {
      status: 500
    });
  }
};
