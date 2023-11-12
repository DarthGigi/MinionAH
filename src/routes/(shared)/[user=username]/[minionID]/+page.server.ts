import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export let config: Config = {
  runtime: "edge"
};

export const load = (async ({ params, fetch }) => {
  const minionID = params.minionID;
  const username = params.user;

  const minion = await prisma.minionSeller.findUnique({
    where: {
      id: minionID,
      AND: [
        {
          user: {
            username: username
          }
        }
      ]
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

  let color;
  const avatar = await fetch(`https://cdn.discordapp.com/avatars/${minion.user.id}/${minion.user.avatar}?size=1024`);
  if (avatar.status === 404) {
    color = await fetch("/api/getColor", {
      headers: {
        imageUrl: `https://cdn.discordapp.com/embed/avatars/${Number(minion.user.id) % 6}.png`
      }
    }).then((res) => res.text());
  } else {
    color = await fetch("/api/getColor", {
      headers: {
        imageUrl: `https://cdn.discordapp.com/avatars/${minion.user.id}/${minion.user.avatar}?size=1024`
      }
    }).then((res) => res.text());
  }

  return {
    minion,
    color
  };
}) satisfies PageServerLoad;
