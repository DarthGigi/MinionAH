import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";
import type { Minion } from "@prisma/client";

export const GET: RequestHandler = async (event) => {
  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });
  await prisma.minion.deleteMany();

  const itemsList = await event.fetch("/filter");
  const items = (await itemsList.json()) as Minion[];

  for (const minion of items) {
    await prisma.minion.create({
      data: {
        id: minion.id,
        name: minion.name,
        generator: minion.generator,
        generator_tier: minion.generator_tier,
        texture: minion.texture
      }
    });
  }

  return new Response();
};
