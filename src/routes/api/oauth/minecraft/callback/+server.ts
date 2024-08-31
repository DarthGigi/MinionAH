import { dev } from "$app/environment";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, MC_AUTH_CLIENT_ID, MC_AUTH_CLIENT_SECRET, MC_AUTH_REDIRECT_URI } from "$env/static/private";
import { lucia } from "$lib/server/lucia";
import { getMcAuthInfo } from "$lib/server/minecraft";
import { TokenRequestResult } from "@oslojs/oauth2";
import { Prisma } from "@prisma/client";
import { error, redirect, type RequestHandler } from "@sveltejs/kit";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

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
        redirect_uri: dev ? "http://localhost:5173/api/oauth/minecraft/callback" : MC_AUTH_REDIRECT_URI,
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

    const getUser = async () => {
      const existingUser = await prisma.user.findFirst({
        where: {
          id: minecraftUser.id
        }
      });

      const [skinResponse, avatarResponse, capeResponse] = await Promise.all([fetch(minecraftUser.properties[0].value.textures.SKIN.url), fetch(`https://mc-heads.net/head/${minecraftUser.id}`), minecraftUser.properties[0].value.textures.CAPE ? fetch(minecraftUser.properties[0].value.textures.CAPE.url) : null]);

      const [skinBuffer, avatarBuffer, capeBuffer] = await Promise.all([skinResponse.arrayBuffer(), avatarResponse.arrayBuffer(), capeResponse ? capeResponse.arrayBuffer() : null]);

      const cloudinaryRequests: Promise<unknown>[] = [];

      let skin: string;
      try {
        skin = Buffer.from(skinBuffer).toString("base64");
        cloudinaryRequests.push(
          cloudinary.uploader.upload(`data:image/png;base64,${skin}`, {
            folder: `users/skins`,
            public_id: minecraftUser.id,
            overwrite: true,
            resource_type: "image"
          })
        );
      } catch (e) {
        console.error(e);
        error(500, "Failed to get skin");
      }

      let avatar: string;
      try {
        avatar = Buffer.from(avatarBuffer).toString("base64");
        cloudinaryRequests.push(
          cloudinary.uploader.upload(`data:image/png;base64,${avatar}`, {
            folder: `users/avatars`,
            public_id: minecraftUser.id,
            overwrite: true,
            resource_type: "image"
          })
        );
      } catch (e) {
        console.error(e);
        error(500, "Failed to get avatar");
      }

      let cape: string | null;
      if (capeBuffer) {
        try {
          cape = Buffer.from(capeBuffer).toString("base64");
          cloudinaryRequests.push(
            cloudinary.uploader.upload(`data:image/png;base64,${cape}`, {
              folder: `users/capes`,
              public_id: minecraftUser.id,
              overwrite: true,
              resource_type: "image"
            })
          );
        } catch {
          error(500, "Failed to get cape");
        }
      } else {
        cape = null;
      }

      try {
        await Promise.all(cloudinaryRequests);
      } catch (e) {
        console.error(e);
        error(500, "Failed to upload to cloudinary");
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
            createdAt: new Date(),
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
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") && !(e instanceof TypeError)) {
          console.error(e);
        }
        return null;
      }
    };

    const user = await getUser();

    if (!user) {
      console.error("Failed to create account");
      error(500, "Failed to create account");
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      path: sessionCookie.attributes.path || "/"
    });
    locals.session = session;
  } catch (e) {
    console.error(e);
    error(500, "Internal Server Error");
  }

  redirect(302, "/signup/password");
}) satisfies RequestHandler;
