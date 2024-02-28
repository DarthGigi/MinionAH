import { fail, redirect } from "@sveltejs/kit";
import { Argon2id } from "oslo/password";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { Actions, PageServerLoad } from "./$types";
import { formSchema } from "./schema";

export const load = (async ({ locals }) => {
  const superValidatedFormSchema = await superValidate(zod(formSchema));
  superValidatedFormSchema.data.username = locals.user!.username;

  return {
    form: superValidatedFormSchema
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  default: async ({ locals, request }) => {
    const form = await superValidate(request, zod(formSchema));

    if (!form.valid) return fail(400, { form });

    try {
      const key = await prisma.key.update({
        where: {
          id: `username:${locals.user!.username.toLowerCase()}`
        },
        data: {
          hashed_password: await new Argon2id().hash(form.data["new-password"])
        },
        include: {
          user: true
        }
      });
      const user = key.user;
      if (!user || key.hashed_password === null) {
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
