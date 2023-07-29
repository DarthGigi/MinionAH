import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import { getAverageColor } from "fast-average-color-node";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const slug = params.slug;

  const minion = await prisma.minionSeller.findUnique({
    where: {
      id: slug
    },
    include: {
      minion: true,
      user: {
        select: {
          accent_color: true,
          avatar: true,
          banner: true,
          id: true,
          locale: true,
          loggedInAt: false,
          username: true
        }
      }
    }
  });

  if (!minion) {
    throw redirect(302, "/");
  }

  return {
    minion,
    color: (await getAverageColor(`https://cdn.discordapp.com/avatars/${minion.user.id}/${minion.user.avatar}?size=1024`)).hex
  };
}) satisfies PageServerLoad;
