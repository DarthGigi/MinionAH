import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (locals.maintenance) {
    return {
      maintenance: true
    };
  }
  return {
    [locals.user !== null ? "user" : ""]: locals.user,
    [locals.isAdmin ? "isAdmin" : ""]: locals.isAdmin
  };
}) satisfies LayoutServerLoad;
