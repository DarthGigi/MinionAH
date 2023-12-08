import * as sitemap from "super-sitemap";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const users = await prisma.user.findMany({
    select: {
      username: true
    }
  });

  const minions = await prisma.minionSeller.findMany({
    select: {
      id: true,
      user: {
        select: {
          username: true
        }
      }
    }
  });

  return await sitemap.response({
    origin: "https://minionah.com",
    excludePatterns: ["/profile.*", ".*/chat.*", ".*/signup/password.*", "^/api.*"],
    paramValues: {
      "/[user=username]": users.map((user) => user.username),
      "/[user=username]/[minionID]": minions.map((minion) => [minion.user.username, minion.id])
    }
  });
};
