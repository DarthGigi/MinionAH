import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// export let config: Config = {
//   runtime: "edge"
// };

export const load = (async ({ params, fetch }) => {
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
    color: await fetch("/api/getColor", {
      headers: {
        imageUrl: `data:image/png;base64,${user.avatar}`
      }
    }).then((res) => res.text()),
    streamed: {
      minions
    }
  };
}) satisfies PageServerLoad;
