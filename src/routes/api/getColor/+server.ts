import { getAverageColor } from "fast-average-color-node";
import type { RequestHandler } from "./$types";

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
