import { dev } from "$app/environment";
import { AD_CLIENT_ID, AD_CLIENT_SECRET, AD_REDIRECT_URI } from "$env/static/private";
import { auth } from "$lib/server/lucia";
import { getMinecraftInfo } from "$lib/server/minecraftAuth";
import { OAuthRequestError, providerUserAuth, validateOAuth2AuthorizationCode } from "@lucia-auth/oauth";
import type { RequestHandler } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";

type AccessTokenResult = {
  token_type: string;
  expires_in: number;
  scope: string;
  access_token: string;
  refresh_token: string;
  user_id: string;
};

export const GET: RequestHandler = async ({ cookies, url, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // get state cookie we set when we got the authorization url
  const stateCookie = cookies.get("microsoft_oauth_state");
  const storedCodeVerifier = cookies.get("microsoft_oauth_code_verifier");

  // validate state
  if (!state || !stateCookie || state !== stateCookie) throw redirect(302, "/login"); // invalid state

  const codeVerifier = cookies.get("microsoft_code_verifier");

  if (!codeVerifier) throw redirect(302, "/login"); // invalid code verifier

  try {
    const tokens = await validateOAuth2AuthorizationCode<AccessTokenResult>(code as string, "https://login.live.com/oauth20_token.srf", {
      clientId: AD_CLIENT_ID,
      codeVerifier,
      clientPassword: {
        clientSecret: AD_CLIENT_SECRET,
        authenticateWith: "client_secret"
      },
      redirectUri: dev ? "http://localhost:5173/api/oauth/microsoft" : AD_REDIRECT_URI
    });

    const minecraftUser = await getMinecraftInfo(tokens.access_token);

    const minecraftUserAuth = providerUserAuth(auth, "minecraft", minecraftUser.id);

    const getUser = async () => {
      let existingUser = await minecraftUserAuth.getExistingUser();

      let avatar: string;
      try {
        const response = await fetch(`https://mc-heads.net/avatar/${minecraftUser.id}`);
        const avatarBuffer = await response.arrayBuffer();
        avatar = Buffer.from(avatarBuffer).toString("base64");
      } catch (e) {
        console.log(e);
        throw new Error("Failed to get avatar");
      }

      if (existingUser) {
        // update user
        await prisma.user.update({
          where: {
            id: existingUser.userId
          },
          data: {
            username: minecraftUser.name,
            avatar: avatar,
            loggedInAt: new Date()
          }
        });
        existingUser = await minecraftUserAuth.getExistingUser();
        return existingUser;
      }

      // create a new user if the user does not exist
      const user = await minecraftUserAuth.createUser({
        userId: minecraftUser.id,
        attributes: {
          id: minecraftUser.id,
          username: minecraftUser.name,
          avatar: avatar,
          loggedInAt: new Date()
        }
      });

      return user;
    };

    const user = await getUser();

    if (!user) throw new Error("Failed to get user");

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {}
    });

    locals.auth.setSession(session);

    return new Response("Redirecting...", {
      status: 302,
      headers: {
        Location: "/profile"
      }
    });
  } catch (e) {
    console.log(e);
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response("Invalid Code", {
        status: 400
      });
    }
    return new Response("Internal Server Error", {
      status: 500
    });
  }
};
