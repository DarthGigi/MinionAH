import { CRON_SECRET } from "$env/static/private";
import { bulkUpdate, type BulkUpdateEntries } from "$lib/server/utilities";
import { captureCheckIn } from "@sentry/sveltekit";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, fetch }) => {
  const checkInId = captureCheckIn({
    monitorSlug: "minion-price",
    status: "in_progress"
  });

  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    console.error("Invalid Authorization header");
    captureCheckIn({
      checkInId,
      monitorSlug: "minion-price",
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
    const minions: Record<string, number> = await fetch("/api/craftcost/minions").then((r) => r.json());

    const bulkUpdates: BulkUpdateEntries = Object.keys(minions).map((minion) => {
      return {
        id: minion,
        craftCost: minions[minion]
      };
    });

    const response = await prisma.$transaction([bulkUpdate("Minion", bulkUpdates, "double precision")]);

    console.info("Minion prices updated", response);

    captureCheckIn({
      checkInId,
      monitorSlug: "minion-price",
      status: "ok"
    });

    return json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Error updating minion prices", e);
    captureCheckIn({
      checkInId,
      monitorSlug: "minion-price",
      status: "error"
    });
    return json({ success: false, error: JSON.stringify(e) }, { status: 500, statusText: "Internal Server Error" });
  }
};
