import type { Config } from "@sveltejs/adapter-vercel";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

// export let config: Config = {
//   runtime: "edge"
// };

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

  return {
    minion,
    color: await fetch("/api/getColor", {
      headers: {
        imageUrl: `data:image/png;base64,${minion.user.avatar}`
      }
    }).then((res) => res.text())
  };
}) satisfies PageServerLoad;
