import { CRON_SECRET } from "$env/static/private";
import { lucia } from "$lib/server/lucia";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, fetch }) => {
  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return json(
      { success: false, error: "Invalid Authorization header" },
      {
        status: 401,
        statusText: "Unauthorized"
      }
    );
  }

  try {
    await lucia.deleteExpiredSessions();
    return json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return json({ success: false, error: e }, { status: 500, statusText: "Internal Server Error" });
  }
};
