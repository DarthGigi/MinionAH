import { json } from "@sveltejs/kit";
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

    return json({ success: true }, { status: 200, statusText: "OK" });
  } catch (e) {
    console.error(e);
    return json({ success: false, error: e }, { status: 500, statusText: "Internal Server Error" });
  }
};
