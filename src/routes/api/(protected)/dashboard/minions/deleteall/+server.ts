import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const DELETE: RequestHandler = async () => {
  try {
    await prisma.minion.deleteMany();
    return json({ success: true }, { headers: { "content-type": "application/json" }, status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return json({ success: false, error: e }, { headers: { "content-type": "application/json" }, status: 500, statusText: "Internal Server Error" });
  }
};
