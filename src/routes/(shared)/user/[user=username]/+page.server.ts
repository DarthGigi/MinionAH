import { getImageColor } from "$lib/server/utilities";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params }) => {
  const username = params.user;

  const minionuser = await prisma.user.findUnique({
    where: {
      username: username
    },
    include: {
      auctions: {
        include: {
          minion: true,
          user: true
        },
        orderBy: {
          timeCreated: "desc"
        }
      },
      settings: {
        select: {
          profileSettings: {
            select: {
              bio: true,
              urls: true
            }
          }
        }
      }
    }
  });

  if (!minionuser) {
    redirect(302, "/");
  }

  return {
    minionuser,
    color: await getImageColor(`https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${minionuser.id}`)
  };
}) satisfies PageServerLoad;
