import type { RequestHandler } from "./$types";
import type { Minion } from "@prisma/client";
import prisma from "$lib/server/prisma";

export const GET: RequestHandler = async ({ fetch }) => {
  return new Response(null, {
    status: 302,
    headers: {
      location: "/"
    }
  });

  await prisma.minion.deleteMany();

  const itemsList = await fetch("/api/filter");
  const items = (await itemsList.json()) as Minion[];

  // maxTier, for each minion generator category get the highest tier from generator_tier and store it in a new column named "maxTier"
  const maxTiers: { [key: string]: number } = {};

  for (const minion of items) {
    console.log(`Getting max tier for ${minion.name}`);
    if (!maxTiers[minion.generator] || minion.generator_tier > maxTiers[minion.generator]) {
      maxTiers[minion.generator] = minion.generator_tier;
    }
    console.log(`Got max tier for ${minion.name},\nprocessed ${items.indexOf(minion)}/${items.length}`);
  }

  for (const minion of items) {
    console.log(`Setting max tier for ${minion.name}`);
    minion.maxTier = maxTiers[minion.generator];
    console.log(`Set max tier for ${minion.name},\nprocessed ${items.indexOf(minion)}/${items.length}`);
  }

  // skin, for each minion, get the 3d head texture from https://mc-heads.net/skin/${minion.texture} and and store it in a new column named "skin"
  for (const minion of items) {
    try {
      console.log(`Getting skin for ${minion.name}`);
      const texture = await fetch(`https://mc-heads.net/skin/${minion.texture}`);
      const textureBuffer = await texture.arrayBuffer();
      const textureBase64 = Buffer.from(textureBuffer).toString("base64");
      minion.skin = textureBase64;
      console.log(`Got skin for ${minion.name},\nprocessed ${items.indexOf(minion)}/${items.length}`);
    } catch (e) {
      console.log(`Failed to get skin for ${minion.name}`);
      throw new Error(`Failed to get skin for ${minion.name}`);
    }
  }

  console.log("\n\nGot all skins\n\n");

  // texture, for each minion get the 2d image texture from https://mc-heads.net/head/${minion.texture} and overwrite it as a base64 string
  for (const minion of items) {
    try {
      console.log(`Getting texture for ${minion.name}`);
      const texture = await fetch(`https://mc-heads.net/head/${minion.texture}`);
      const textureBuffer = await texture.arrayBuffer();
      const textureBase64 = Buffer.from(textureBuffer).toString("base64");
      minion.texture = textureBase64;
      console.log(`Got texture for ${minion.name},\nprocessed ${items.indexOf(minion)}/${items.length}`);
    } catch (e) {
      console.log(`Failed to get texture for ${minion.name}`);
      throw new Error(`Failed to get texture for ${minion.name}`);
    }
  }

  console.log("\n\nGot all textures\n\n");

  console.log("Filling database with minions...\n\n");

  await prisma.minion
    .createMany({
      data: [
        ...items.map((minion) => ({
          id: minion.id,
          name: minion.name,
          generator: minion.generator,
          generator_tier: minion.generator_tier,
          texture: minion.texture,
          skin: minion.skin,
          maxTier: minion.maxTier
        }))
      ]
    })
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to create minions");
    });

  // return updated items list
  return new Response(JSON.stringify(items), {
    headers: {
      "content-type": "application/json"
    }
  });
};
