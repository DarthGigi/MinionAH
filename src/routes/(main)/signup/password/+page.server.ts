import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { auth } from "$lib/server/lucia";
import { message, superValidate } from "sveltekit-superforms/server";
import { formSchema } from "./schema";
import { fail } from "@sveltejs/kit";

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
      const user = await auth.createKey({
        providerId: "username",
        providerUserId: locals.user!.username.toLocaleLowerCase(),
        password: form.data["new-password"],
        userId: locals.user!.id
      });
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

    throw redirect(302, "/profile");
  }
};
