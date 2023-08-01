import { redirect } from "@sveltejs/kit";
import { getAverageColor } from "fast-average-color-node";
import type { PageServerLoad } from "./$types";
export const config = {
  runtime: "edge"
};

export const load = (async ({ params }) => {
  const username = params.user;

  const user = await prisma.user.findUnique({
    where: {
      username: username
    },
    include: {
      minions: true
    }
  });

  if (!user) {
    throw redirect(302, "/");
  }

  const minions = prisma.minionSeller.findMany({
    where: {
      user: {
        id: user.id
      }
    },
    include: {
      minion: true,
      user: true
    },
    orderBy: {
      timeCreated: "desc"
    }
  });

  return {
    userprofile: user,
    color: (await getAverageColor(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=1024`)).hex,
    streamed: {
      minions: minions
    }
  };
}) satisfies PageServerLoad;
