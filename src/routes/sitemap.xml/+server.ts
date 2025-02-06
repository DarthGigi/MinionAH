import { error } from "@sveltejs/kit";
import * as sitemap from "super-sitemap";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  try {
    return await sitemap.response({
      origin: "https://minionah.com",
      excludeRoutePatterns: [".*\\(protected\\).*", "^/api.*", ".*\\[user=username\\].*"],
      additionalPaths: ["/api/craftcost/docs"]
    });
  } catch (e) {
    console.error(e);
    error(500, "Internal Server Error");
  }
};
