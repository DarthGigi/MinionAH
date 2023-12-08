import { auth } from "$lib/server/lucia";
import { fail, redirect } from "@sveltejs/kit";
import { LuciaError } from "lucia";
import { message, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { formSchema } from "./schema";

export const load = (async () => {
  const superValidatedFormSchema = await superValidate(formSchema);

  return {
    form: superValidatedFormSchema
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const form = await superValidate(request, formSchema);

    if (!form.valid) return fail(400, { form });

    try {
      const key = await auth.useKey("username", form.data.username.toLowerCase(), form.data["current-password"]);
      const session = await auth.createSession({
        userId: key.userId,
        attributes: {}
      });
      const sessionCookie = auth.createSessionCookie(session);
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    } catch (e) {
      if (e instanceof LuciaError && (e.message === "AUTH_INVALID_KEY_ID" || e.message === "AUTH_INVALID_PASSWORD")) {
        // user does not exist
        // or invalid password
        console.error("Incorrect username or password");
        return message(
          form,
          { title: "Failed to log you in", description: 'The username or password you entered is incorrect. Please try again. <br/><br/>If you forgot your password, you can reset it by clicking the "Forgot Password" button.' },
          {
            status: 400
          }
        );
      }
      console.error(e);
      return message(
        form,
        { title: "Unable to log you in", description: "We could not log you in due to a technical issue on our end. Please try again. <br/>If this issue keeps happening, please contact us." },
        {
          status: 500
        }
      );
    }
    throw redirect(302, "/profile");
  }
};
