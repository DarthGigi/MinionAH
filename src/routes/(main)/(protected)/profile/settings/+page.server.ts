import { superValidate } from "sveltekit-superforms/server";
import type { PageServerLoad } from "../$types";
import { profileFormSchema } from "./profile-form.svelte";
import { fail, type Actions } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    form: await superValidate(locals.user, profileFormSchema)
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, profileFormSchema);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }
    return {
      form
    };
  }
};
