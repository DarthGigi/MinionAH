import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    await prisma.chat.delete({
      where: {
        id: data.id
      }
    });
    return new Response(JSON.stringify({ success: true, message: "Successfully deleted the chat" }), {
      headers: { "content-type": "application/json" },
      status: 200,
      statusText: "Success"
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete the chat" }), {
      headers: { "content-type": "application/json" },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};
