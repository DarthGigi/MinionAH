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
    return new Response(JSON.stringify({ success: true, message: "Successfully deleted minion" }), {
      headers: { "content-type": "application/json" },
      status: 200,
      statusText: "Success"
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete minion" }), {
      headers: { "content-type": "application/json" },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};
