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
      },
      oauth: {
        where: {
          provider: "discord",
          userId: locals.user!.id
        }
      }
    }
  });
  return { userData };
}) satisfies LayoutServerLoad;
