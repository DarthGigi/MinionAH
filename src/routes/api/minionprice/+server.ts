import { CRON_SECRET } from "$env/static/private";
import { bulkUpdate, type BulkUpdateEntries } from "$lib/server/utilities";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request, fetch }) => {
  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ success: false, error: "Invalid Authorization header" }, null, 2), {
      headers: { "content-type": "application/json" },
      status: 401,
      statusText: "Unauthorized"
    });
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

    return new Response(JSON.stringify({ success: true }, null, 2), { headers: { "content-type": "application/json" }, status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e }, null, 2), { headers: { "content-type": "application/json" }, status: 500, statusText: "Internal Server Error" });
  }
};
