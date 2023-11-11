import { get } from "http";
import type { RequestHandler } from "./$types";
import { getAverageColor } from "fast-average-color-node";

export const GET: RequestHandler = async ({ request }) => {
  const imageUrl = request.headers.get("imageUrl");
  if (!imageUrl) {
    return new Response("#000000", {
      status: 400,
      headers: {
        "content-type": "text/plain"
      },
      statusText: "No imageUrl header"
    });
  }

  const color = (await getAverageColor(imageUrl)).hex;
  return new Response(color, {
    headers: {
      "content-type": "text/plain"
    }
  });
};
