import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    const ids = data.ids as string[];

    await prisma.auction.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    return json(
      { success: true, message: "Successfully deleted the auction" },
      {
        status: 200,
        statusText: "Success"
      }
    );
  } catch (e) {
    console.error(e);
    return json(
      { success: false, message: "Failed to delete the auction" },
      {
        status: 500,
        statusText: "Internal Server Error"
      }
    );
  }
};
