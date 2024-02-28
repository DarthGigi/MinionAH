import { fail, type Actions } from "@sveltejs/kit";
import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { profileFormSchema } from "./profile-form.svelte";

export const load: PageServerLoad = async ({ locals }) => {
  return {
    form: await superValidate(locals.user, zod(profileFormSchema))
  };
};

export const actions: Actions = {
  default: async (event) => {
    const form = await superValidate(event, zod(profileFormSchema));
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
