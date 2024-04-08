import { getAverageColor } from "fast-average-color-node";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  try {
    const imageUrl = request.headers.get("imageUrl");
    if (!imageUrl) {
      return new Response("#171717", {
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
  } catch (e) {
    console.error(e);
    return new Response("#171717", {
      status: 500,
      headers: {
        "content-type": "text/plain"
      },
      statusText: "Error getting color"
    });
  }
};
