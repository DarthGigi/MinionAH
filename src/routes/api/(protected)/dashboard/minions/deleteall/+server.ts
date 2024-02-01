import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async () => {
  try {
    await prisma.minion.deleteMany();
    return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json" }, status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e }), { headers: { "content-type": "application/json" }, status: 500, statusText: "Internal Server Error" });
  }
};
