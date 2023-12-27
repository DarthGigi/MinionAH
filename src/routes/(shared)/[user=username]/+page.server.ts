import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// export let config: Config = {
//   runtime: "edge"
// };

export const load = (async ({ params, fetch }) => {
  const username = params.user;

  const minionuser = await prisma.user.findUnique({
    where: {
      username: username
    },
    include: {
      minions: true
    }
  });

  if (!minionuser) {
    redirect(302, "/");
  }

  const minions = prisma.minionSeller.findMany({
    where: {
      user: {
        id: minionuser.id
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
    minionuser,
    color: await fetch("/api/getColor", {
      headers: {
        imageUrl: `data:image/png;base64,${minionuser.avatar}`
      }
    }).then((res) => res.text()),
    streamed: {
      minions
    }
  };
}) satisfies PageServerLoad;
