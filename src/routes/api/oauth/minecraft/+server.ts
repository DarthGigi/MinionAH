import { dev } from "$app/environment";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, MC_AUTH_CLIENT_ID, MC_AUTH_CLIENT_SECRET, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { lucia } from "$lib/server/lucia";
import { Prisma } from "@prisma/client";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { v2 as cloudinary } from "cloudinary";
import { OAuth2Client, OAuth2RequestError } from "oslo/oauth2";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

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

const provider = new OAuth2Client(MC_AUTH_CLIENT_ID, "https://mc-auth.com/oAuth2/authorize", "https://mc-auth.com/oAuth2/token", {
  redirectURI: dev ? "http://localhost:5173/api/oauth/minecraft" : MC_AUTH_REDIRECT_URI
});

export const POST = (async ({ cookies, request, locals }) => {
  const { code, state } = await request.json();

  // get state cookie we set when we got the authorization url
  const stateCookie = cookies.get("minecraft_oauth_state");
  cookies.delete("minecraft_oauth_state", { path: "/" });

  // validate state
  if (!state || !stateCookie || state !== stateCookie) redirect(302, "/login"); // invalid state

  const codeVerifier = cookies.get("minecraft_code_verifier");
  cookies.delete("minecraft_code_verifier", { path: "/" });

  if (!codeVerifier) redirect(302, "/login"); // invalid code verifier

  try {
    const tokens = await provider.validateAuthorizationCode(code as string, {
      codeVerifier,
      credentials: MC_AUTH_CLIENT_SECRET,
      authenticateWith: "request_body"
    });

    if ("error" in tokens) {
      console.error(tokens.error);
      error(500, "Error getting MC profile");
    }

    const minecraftUser = await getMinecraftInfo(tokens.access_token);

    const getUser = async () => {
      let existingUser = await prisma.user.findFirst({
        where: {
          id: minecraftUser.id
        }
      });

      let skin: string;
      try {
        const response = await fetch(minecraftUser.properties[0].value.textures.SKIN.url);
        const avatarBuffer = await response.arrayBuffer();
        skin = Buffer.from(avatarBuffer).toString("base64");
        const upload = await cloudinary.uploader.upload(`data:image/png;base64,${skin}`, {
          folder: `users/skins`,
          public_id: minecraftUser.id,
          overwrite: true,
          resource_type: "image"
        });
      } catch (e) {
        console.error(e);
        error(500, "Failed to get skin");
      }

      let avatar: string;
      try {
        const response = await fetch(`https://mc-heads.net/head/${minecraftUser.id}`);
        const avatarBuffer = await response.arrayBuffer();
        avatar = Buffer.from(avatarBuffer).toString("base64");
        const upload = await cloudinary.uploader.upload(`data:image/png;base64,${avatar}`, {
          folder: `users/avatars`,
          public_id: minecraftUser.id,
          overwrite: true,
          resource_type: "image"
        });
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
          const upload = await cloudinary.uploader.upload(`data:image/png;base64,${cape}`, {
            folder: `users/capes`,
            public_id: minecraftUser.id,
            overwrite: true,
            resource_type: "image"
          });
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
            id: existingUser.id
          },
          data: {
            username: minecraftUser.name
          }
        });
        return existingUser;
      }

      // create a new user if the user does not exist
      try {
        const user = await prisma.user.create({
          data: {
            id: minecraftUser.id,
            username: minecraftUser.name,
            loggedInAt: new Date(),
            key: {
              createMany: {
                data: [
                  {
                    id: `minecraft:${minecraftUser.id}`,
                    hashed_password: null
                  },
                  {
                    id: `username:${minecraftUser.name.toLocaleLowerCase()}`,
                    hashed_password: null
                  }
                ]
              }
            }
          }
        });
        return user;
      } catch (e: any) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") && !(e instanceof TypeError)) {
          console.error(e);
        }
        return null;
      }
    };

    const user = await getUser();

    if (!user) throw new Error("Failed to get user");

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: sessionCookie.attributes.path || "/"
    });
    locals.session = session;
  } catch (e: any) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      // invalid code
      error(400, "Invalid Code");
    }

    error(500, "Internal Server Error");
  }
  redirect(302, "/signup/password");
}) satisfies RequestHandler;
