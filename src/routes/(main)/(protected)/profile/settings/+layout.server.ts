import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
  const userData = await prisma.user.findUnique({
    where: {
      id: locals.user!.id
    },
    select: {
      settings: {
        include: {
          notificationSettings: true,
          profileSettings: true
        }
      }
    }
  });
  return { userData };
}) satisfies LayoutServerLoad;
