import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const minionID = params.minionID;
  const username = params.user;

  const userMinion = await prisma.auction.findUnique({
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
    color: await fetch("/api/internal/color", {
      headers: {
        imageUrl: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${userMinion.user.id}`
      }
    }).then((res) => res.text())
  };
}) satisfies PageServerLoad;
