import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();

    const ids = data.ids as string[];

    await prisma.minionSeller.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
    return new Response(JSON.stringify({ success: true, message: "Successfully deleted the auction" }), {
      headers: { "content-type": "application/json" },
      status: 200,
      statusText: "Success"
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete the auction" }), {
      headers: { "content-type": "application/json" },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};
