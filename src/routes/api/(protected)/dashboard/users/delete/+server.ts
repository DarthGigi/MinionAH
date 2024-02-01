import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    await prisma.user.delete({
      where: {
        id: data.id
      }
    });
    return new Response(JSON.stringify({ success: true, message: "Successfully deleted the user" }), {
      headers: { "content-type": "application/json" },
      status: 200,
      statusText: "Success"
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, message: "Failed to delete the user" }), {
      headers: { "content-type": "application/json" },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};
