import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const unreadChats = (locals.user?._count.chatsAsUser1 ?? 0) + (locals.user?._count.chatsAsUser2 ?? 0) > 0;
  const unreadCount = locals.user ? (locals.user._count.chatsAsUser1 ?? 0) + (locals.user._count.chatsAsUser2 ?? 0) : 0;

  return {
    user: locals.user,
    isAdmin: locals.isAdmin,
    unreadChats,
    unreadCount
  };
}) satisfies LayoutServerLoad;
