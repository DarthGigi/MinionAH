import { DISCORD_BOT_API_SECRET } from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

interface AuctionCreationBody {
  discordID: string;
  auction: {
    type: string;
    tier: number;
    amount: number;
    price: number;
    mithrilInfused: boolean;
  };
}

interface AuctionDeletionBody {
  discordID: string;
  auctionID: string;
}

interface AuctionGetBody {
  discordID: string;
}

export const GET: RequestHandler = async ({ request, url }) => {
  if (request.headers.get("Authorization") !== DISCORD_BOT_API_SECRET) {
    return json({ message: "Unauthorized" }, { status: 401, statusText: "Unauthorized" });
  }

  const params = url.searchParams;
  const discordID = params.get("discordID") as AuctionGetBody["discordID"];

  if (!discordID) {
    return json({ message: "Invalid parameters" }, { status: 400, statusText: "Bad Request" });
  }

  const user = await prisma.userOAuthProvider.findUnique({
    where: {
      id: discordID,
      provider: "discord"
    }
  });

  if (!user) {
    return json({ message: "User not found" }, { status: 403, statusText: "Forbidden" });
  }

  const auctions = await prisma.auction.findMany({
    where: {
      user: {
        id: user.userId
      }
    },
    include: {
      minion: {
        select: {
          craftCost: true,
          generator: true,
          generator_tier: true,
          id: true,
          maxTier: true
        }
      },
      user: {
        select: {
          id: true,
          username: true
        }
      }
    }
  });

  return json(auctions, { status: 200, statusText: "OK" });
};

export const POST: RequestHandler = async ({ request }) => {
  if (request.headers.get("Authorization") !== DISCORD_BOT_API_SECRET) {
    return json({ message: "Unauthorized" }, { status: 401, statusText: "Unauthorized" });
  }

  const body: AuctionCreationBody = await request.json().catch(() => {
    return json({ message: "Invalid JSON" }, { status: 400, statusText: "Bad Request" });
  });

  const [user, minion] = await Promise.all([
    prisma.userOAuthProvider.findUnique({
      where: {
        id: body.discordID,
        provider: "discord"
      }
    }),
    prisma.minion.findFirst({
      where: {
        generator: body.auction.type,
        AND: [
          {
            generator_tier: body.auction.tier
          }
        ]
      }
    })
  ]);

  if (!user) {
    return json({ message: "User not found" }, { status: 403, statusText: "Forbidden" });
  }

  if (!minion) {
    return json({ message: "Minion not found" }, { status: 404, statusText: "Not Found" });
  }

  try {
    const auction = await prisma.auction.create({
      data: {
        amount: body.auction.amount,
        price: Number(body.auction.price),
        hasInfusion: body.auction.mithrilInfused,
        user: {
          connect: {
            id: user.userId
          }
        },
        minion: {
          connect: {
            id: minion.id
          }
        }
      }
    });

    return json(auction, { status: 201, statusText: "Created" });
  } catch (e) {
    console.error(e);
    return json({ message: "Something went wrong trying to create the auction" }, { status: 500, statusText: "Internal Server Error" });
  }
};

export const DELETE: RequestHandler = async ({ request }) => {
  if (request.headers.get("Authorization") !== DISCORD_BOT_API_SECRET) {
    return json({ message: "Unauthorized" }, { status: 401, statusText: "Unauthorized" });
  }

  const body: AuctionDeletionBody = await request.json().catch(() => {
    return json({ message: "Invalid JSON" }, { status: 400, statusText: "Bad Request" });
  });

  const user = await prisma.userOAuthProvider.findUnique({
    where: {
      id: body.discordID,
      provider: "discord"
    }
  });

  if (!user) {
    return json({ message: "User not found" }, { status: 403, statusText: "Forbidden" });
  }

  try {
    const auction = await prisma.auction.delete({
      where: {
        id: body.auctionID,
        user_id: user.userId
      }
    });

    return json(auction, { status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return json({ message: "Something went wrong trying to delete the auction" }, { status: 500, statusText: "Internal Server Error" });
  }
};
