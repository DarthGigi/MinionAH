import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const minionID = params.minionID;
  const username = params.user;

  const userMinion = await prisma.minionSeller.findUnique({
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
      user: true
    }
  });

  if (!userMinion) {
    redirect(302, "/");
  }

  return {
    userMinion,
    color: await fetch("/api/getColor", {
      headers: {
        imageUrl: `data:image/png;base64,${userMinion.user.avatar}`
      }
    }).then((res) => res.text())
  };
}) satisfies PageServerLoad;
