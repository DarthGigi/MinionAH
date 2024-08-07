import { lucia } from "$lib/server/lucia";
import { hash, verify, type Options } from "@node-rs/argon2";
import { fail, redirect } from "@sveltejs/kit";
import { LegacyScrypt } from "lucia";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { formSchema } from "./schema";

const hashOptions = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
} satisfies Options;

export const load = (async () => {
  return {
    form: await superValidate(zod(formSchema))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, zod(formSchema));

    if (!form.valid) return fail(400, { form });

    try {
      const key = await prisma.key.findFirst({
        where: {
          id: `username:${form.data.username.toLowerCase()}`
        }
      });

      if (!key) {
        return message(
          form,
          { title: "Failed to log you in", description: 'The username or password you entered is incorrect. Please try again. <br/><br/>If you forgot your password, you can reset it by clicking the "Forgot Password" button.' },
          {
            status: 400
          }
        );
      }
      const password = form.data["current-password"];
      const oldHash = key.hashed_password!;
      const newHash = await hash(password, hashOptions);

      const validPasswordOld = await new LegacyScrypt().verify(oldHash, password);

      const validPassword = await verify(newHash, password);

      if (!validPasswordOld && !validPassword) {
        return message(
          form,
          { title: "Failed to log you in", description: 'The username or password you entered is incorrect. Please try again. <br/><br/>If you forgot your password, you can reset it by clicking the "Forgot Password" button.' },
          {
            status: 400
          }
        );
      } else if (validPasswordOld) {
        await prisma.key.update({
          where: {
            id: key.id
          },
          data: {
            hashed_password: await hash(password, hashOptions)
          }
        });
      }

      const session = await lucia.createSession(key?.user_id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(sessionCookie.name, sessionCookie.value, {
        ...sessionCookie.attributes,
        path: sessionCookie.attributes.path || "/"
      });
    } catch (e) {
      console.error(e);
      return message(
        form,
        { title: "Unable to log you in", description: "We could not log you in due to a technical issue on our end. Please try again. <br/>If this issue keeps happening, please contact us." },
        {
          status: 500
        }
      );
    }
    redirect(302, "/profile");
  }
};
