import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    const ids = data.ids as string[];

    await prisma.minion.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    return json(
      { success: true, message: "Successfully deleted minion" },
      {
        status: 200,
        statusText: "Success"
      }
    );
  } catch (error) {
    console.error(error);
    return json(
      { success: false, message: "Failed to delete minion" },
      {
        status: 500,
        statusText: "Internal Server Error"
      }
    );
  }
};
