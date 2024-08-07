import { error } from "@sveltejs/kit";
import * as sitemap from "super-sitemap";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    const [users, minions] = await Promise.all([
      prisma.user.findMany({
        select: {
          username: true
        }
      }),
      prisma.auction.findMany({
        select: {
          id: true,
          user: {
            select: {
              username: true
            }
          }
        }
      })
    ]);

    return await sitemap.response({
      origin: "https://minionah.com",
      excludeRoutePatterns: [".*\\(protected\\).*", "^/api.*"],
      additionalPaths: ["/api/craftcost/docs"],
      paramValues: {
        "/user/[user=username]": users.map(({ username }: { username: string }) => username),
        "/user/[user=username]/[minionID]": minions.map(({ user: { username }, id }: { user: { username: string }; id: string }) => [username, id])
      }
    });
  } catch (e) {
    console.error(e);
    error(500, "Internal Server Error");
  }
};
