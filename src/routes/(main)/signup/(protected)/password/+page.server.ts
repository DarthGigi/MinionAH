import { auth } from "$lib/server/lucia";
import { fail, redirect } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms/server";
import type { Actions, PageServerLoad } from "./$types";
import { formSchema } from "./schema";

export const load = (async ({ locals }) => {
  const superValidatedFormSchema = await superValidate(formSchema);
  superValidatedFormSchema.data.username = locals.user!.username;

  return {
    form: superValidatedFormSchema
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, formSchema);

    if (!form.valid) return fail(400, { form });

    try {
      const user = await auth.updateKeyPassword("username", locals.user!.username.toLocaleLowerCase(), form.data["new-password"]);
      console.log(user);
      if (!user || !user.passwordDefined) {
        console.error("Failed to create account");
        return message(
          form,
          { title: "Failed to create account", description: "We could not create your account due to a technical issue on our end. Please try again. <br/>If this issue keeps happening, please contact us." },
          {
            status: 400
          }
        );
      }
    } catch (error) {
      console.error(error);
      return message(
        form,
        { title: "Unable to create account", description: "We are unable to create your account due to a technical issue on our end. Please try again. <br/>If this issue keeps happening, please contact us." },
        {
          status: 500
        }
      );
    }

    redirect(302, "/profile");
  }
};
