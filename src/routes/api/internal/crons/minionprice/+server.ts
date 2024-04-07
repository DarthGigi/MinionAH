import { CRON_SECRET } from "$env/static/private";
import { bulkUpdate, type BulkUpdateEntries } from "$lib/server/utilities";
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
    const minions: Record<string, number> = await fetch("/api/craftcost/minions").then((r) => r.json());

    const bulkUpdates: BulkUpdateEntries = Object.keys(minions).map((minion) => {
      return {
        id: minion,
        craftCost: minions[minion]
      };
    });

    await prisma.$transaction([bulkUpdate("Minion", bulkUpdates)]);

    return json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return json({ success: false, error: e }, { status: 500, statusText: "Internal Server Error" });
  }
};
