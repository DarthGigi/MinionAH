import { getImageColor } from "$lib/server/utilities";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
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
    color: await getImageColor(`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${userMinion.user.id}`)
  };
}) satisfies PageServerLoad;
