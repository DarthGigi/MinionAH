import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const username = params.user;

  const minionuser = await prisma.user.findUnique({
    where: {
      username: username
    },
    include: {
      auctions: true
    }
  });

  if (!minionuser) {
    redirect(302, "/");
  }

  const minions = prisma.auction.findMany({
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
    color: await fetch("/api/internal/color", {
      headers: {
        imageUrl: `https://res.cloudinary.com/minionah/image/upload/v1/users/avatars/${minionuser.id}`
      }
    }).then((res) => res.text()),
    streamed: {
      minions
    }
  };
}) satisfies PageServerLoad;
