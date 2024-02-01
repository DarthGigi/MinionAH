import type { RequestHandler } from "./$types";

export const PATCH: RequestHandler = async ({ fetch }) => {
  try {
    const minions: Record<string, number> = await fetch("/api/craftcost/minions").then((r) => r.json());

    const prismapromises = Object.keys(minions).map((minion) => {
      return prisma.minion.update({
        where: { id: minion },
        data: { craftCost: minions[minion] }
      });
    });

    await prisma.$transaction(prismapromises);

    return new Response(JSON.stringify({ success: true }), { headers: { "content-type": "application/json" }, status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ success: false, error: e }), { headers: { "content-type": "application/json" }, status: 500, statusText: "Internal Server Error" });
  }
};
