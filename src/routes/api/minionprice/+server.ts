import type { RequestHandler } from "./$types";
import { CRON_SECRET } from "$env/static/private";

export const GET: RequestHandler = async ({ request, fetch }) => {
  if (!CRON_SECRET || request.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response(JSON.stringify({ success: false, error: "Invalid Authorization header" }, null, 2), {
      headers: { "content-type": "application/json" },
      status: 401,
      statusText: "Unauthorized"
    });
  }

  const minions: Record<string, number> = await fetch("/api/craftcost/minions").then((r) => r.json());

  const prismapromises = Object.keys(minions).map((minion) =>
    prisma.minion.update({
      where: { id: minion },
      data: { craftCost: minions[minion] }
    })
  );

  await prisma.$transaction(async () => {
    await Promise.all([prismapromises]);
  });

  return new Response(JSON.stringify({ success: true }, null, 2), { headers: { "content-type": "application/json" }, status: 200, statusText: "OK" });
};
