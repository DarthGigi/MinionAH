import * as sitemap from "super-sitemap";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async () => {
  try {
    const { users, minions } = await Promise.all([
      prisma.user.findMany({
        select: {
          username: true
        }
      }),
      prisma.minionSeller.findMany({
        select: {
          id: true,
          user: {
            select: {
              username: true
            }
          }
        }
      })
    ]).then(([users, minions]) => ({ users, minions }));

    return await sitemap.response({
      origin: "https://minionah.com",
      excludePatterns: [".*\\(protected\\).*", "^/api.*"],
      additionalPaths: ["/api/craftcost/docs"],
      paramValues: {
        "/[user=username]": users.map(({ username }: { username: string }) => username),
        "/[user=username]/[minionID]": minions.map(({ user: { username }, id }: { user: { username: string }; id: string }) => [username, id])
      }
    });
  } catch (e) {
    console.error(e);
    error(500, "Internal Server Error");
  }
};
