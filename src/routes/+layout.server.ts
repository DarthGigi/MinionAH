import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  if (locals.maintenance) {
    return {
      maintenance: true
    };
  }
  const unreadChats = (locals.user?._count.chatsAsUser1 ?? 0) + (locals.user?._count.chatsAsUser2 ?? 0) > 0;

  return {
    [locals.user !== null ? "user" : ""]: locals.user,
    [locals.isAdmin ? "isAdmin" : ""]: locals.isAdmin,
    [locals.user !== null && unreadChats ? "unreadChats" : ""]: unreadChats
  };
}) satisfies LayoutServerLoad;
