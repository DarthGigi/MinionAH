import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  return {
    [locals.user !== null ? "user" : ""]: locals.user
  };
}) satisfies LayoutServerLoad;
