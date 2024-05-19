import { CRON_SECRET } from "$env/static/private";
import { lucia } from "$lib/server/lucia";
import * as Sentry from "@sentry/sveltekit";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "cleanup",
    status: "in_progress"
  });

  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "cleanup",
      status: "error"
    });
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
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "cleanup",
      status: "ok"
    });
    return json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    Sentry.captureCheckIn({
      checkInId,
      monitorSlug: "cleanup",
      status: "error"
    });
    return json({ success: false, error: e }, { status: 500, statusText: "Internal Server Error" });
  }
};
