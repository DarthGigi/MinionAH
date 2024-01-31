import { dev } from "$app/environment";
import { MC_AUTH_CLIENT_ID, MC_AUTH_CLIENT_SECRET, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { auth } from "$lib/server/lucia";
import { OAuthRequestError, providerUserAuth, validateOAuth2AuthorizationCode } from "@lucia-auth/oauth";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Prisma } from "@prisma/client";

async function getMinecraftInfo(access_token: string): Promise<MCAuthProfile> {
  const res = await fetch("https://mc-auth.com/api/v2/profile ", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token
    }
  });
  if (res.status != 200) {
    console.error(res.status, res.statusText);
    throw new Error("Error getting MC profile");
  }
  const body = await res.json();
  const propertiesValueJSON = JSON.parse(Buffer.from(body.properties[0].value, "base64").toString("utf-8"));
  return {
    id: body.id,
    name: body.name,
    properties: [
      {
        name: body.properties[0].name,
        value: propertiesValueJSON,
        signature: body.properties[0].signature
      }
    ],
    profileActions: body.profileActions,
    legacy: body.legacy
  };
}

type MCAuthResponseSuccess = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  state: string;
};

type MCAuthResponseError = {
  error: number;
  message: string;
};

type MCAuthProfile = {
  id: string;
  name: string;
  properties: {
    name: string;
    value: {
      timestamp: number;
      profileId: string;
      profileName: string;
      signatureRequired: boolean;
      textures: {
        SKIN: {
          url: string;
        };
        CAPE?: {
          url: string;
        };
      };
    };
    signature: string;
  }[];
  profileActions: String[];
  legacy: boolean;
};

export const load = (async ({ cookies, url, locals }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // get state cookie we set when we got the authorization url
  const stateCookie = cookies.get("minecraft_oauth_state");
  cookies.delete("minecraft_oauth_state", { path: "/" });

  // validate state
  if (!state || !stateCookie || state !== stateCookie) redirect(302, "/login"); // invalid state

  const codeVerifier = cookies.get("minecraft_code_verifier");
  cookies.delete("minecraft_code_verifier", { path: "/" });

  if (!codeVerifier) redirect(302, "/login"); // invalid code verifier

  try {
    const tokens = await validateOAuth2AuthorizationCode<MCAuthResponseSuccess | MCAuthResponseError>(code as string, "https://mc-auth.com/oAuth2/token", {
      clientId: MC_AUTH_CLIENT_ID,
      clientPassword: {
        clientSecret: MC_AUTH_CLIENT_SECRET,
        authenticateWith: "client_secret"
      },
      redirectUri: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI,
      codeVerifier
    });

    if ("error" in tokens) {
      console.error(tokens.error, tokens.message);
      error(500, "Error getting MC profile");
    }

    const minecraftUser = await getMinecraftInfo(tokens.access_token);

    const minecraftUserAuth = providerUserAuth(auth, "minecraft", minecraftUser.id);

    const getUser = async () => {
      let existingUser = await minecraftUserAuth.getExistingUser();

      let skin: string;
      try {
        const response = await fetch(minecraftUser.properties[0].value.textures.SKIN.url);
        const avatarBuffer = await response.arrayBuffer();
        skin = Buffer.from(avatarBuffer).toString("base64");
      } catch (e) {
        console.error(e);
        error(500, "Failed to get skin");
      }

      let avatar: string;
      try {
        const response = await fetch(`https://mc-heads.net/head/${minecraftUser.id}`);
        const avatarBuffer = await response.arrayBuffer();
        avatar = Buffer.from(avatarBuffer).toString("base64");
      } catch (e) {
        console.error(e);
        error(500, "Failed to get avatar");
      }

      let cape: string | null;
      if (minecraftUser.properties[0].value.textures.CAPE) {
        try {
          // @ts-ignore
          const response = await fetch(minecraftUser.properties[0].value.textures.CAPE.url);
          const avatarBuffer = await response.arrayBuffer();
          cape = Buffer.from(avatarBuffer).toString("base64");
        } catch (e) {
          error(500, "Failed to get cape");
        }
      } else {
        cape = null;
      }

      if (existingUser) {
        // update user
        await prisma.user.update({
          where: {
            id: existingUser.userId
          },
          data: {
            username: minecraftUser.name,
            avatar,
            skin,
            cape
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
          skin,
          cape,
          loggedInAt: new Date()
        }
      });
      return user;
    };

    const user = await getUser();

    if (!user) throw new Error("Failed to get user");

    try {
      const key = await auth.createKey({
        providerId: "username",
        providerUserId: minecraftUser.name.toLocaleLowerCase(),
        password: null,
        userId: user.userId
      });
    } catch (e: any) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") && !(e instanceof TypeError)) {
        console.error(e);
      }
    }

    const session = await auth.createSession({
      userId: user.userId,
      attributes: {}
    });

    locals.auth.setSession(session);
  } catch (e: any) {
    console.error(e);
    if (e instanceof OAuthRequestError) {
      // invalid code
      error(400, "Invalid Code");
    }

    error(500, "Internal Server Error");
  }
  redirect(302, "/signup/password");
}) satisfies PageServerLoad;
