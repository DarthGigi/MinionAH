import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export let config: Config = {
  runtime: "edge"
};

const prismaEdge = new PrismaClient().$extends(withAccelerate());

export const load = (async ({ params, fetch }) => {
  const username = params.user;

  const user = await prismaEdge.user.findUnique({
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

  const minions = prismaEdge.minionSeller.findMany({
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

  let color;
  const avatar = await fetch(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=1024`);
  if (avatar.status === 404) {
    color = await fetch("/api/getColor", {
      headers: {
        imageUrl: `https://cdn.discordapp.com/embed/avatars/${Number(user.id) % 6}.png`
      }
    }).then((res) => res.text());
  } else {
    color = await fetch("/api/getColor", {
      headers: {
        imageUrl: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}?size=1024`
      }
    }).then((res) => res.text());
  }

  return {
    userprofile: user,
    color,
    streamed: {
      minions
    }
  };
}) satisfies PageServerLoad;
