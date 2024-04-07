import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "$env/static/private";
import prisma from "$lib/server/prisma";
import type { Minion } from "@prisma/client";
import { json } from "@sveltejs/kit";
import { v2 as cloudinary } from "cloudinary";
import type { RequestHandler } from "./$types";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true
});

async function fetchTexture(minion: Minion, type: "skin" | "head") {
  try {
    console.info(`Getting ${type} for ${minion.name}`);
    const texture = await fetch(`https://mc-heads.net/${type}/${minion.texture}`);
    const textureBuffer = await texture.arrayBuffer();
    const textureBase64 = Buffer.from(textureBuffer).toString("base64");
    const upload = await cloudinary.uploader.upload(`data:image/png;base64,${textureBase64}`, {
      folder: `minions/${type}`,
      public_id: minion.id,
      overwrite: true,
      resource_type: "image"
    });
    // @ts-ignore
    minion[type] = "";
    console.info(`Got ${type} for ${minion.name}`);
  } catch (e) {
    console.error(`Failed to get ${type} for ${minion.name}`);
    throw new Error(`Failed to get ${type} for ${minion.name}`);
  }
}

export const PUT: RequestHandler = async ({ fetch }) => {
  const itemsList = await fetch("/api/internal/dashboard/minions/filter");
  const items = (await itemsList.json()) as Minion[];

  const maxTiers: { [key: string]: number } = {};

  items.forEach((minion, index) => {
    console.info(`Getting max tier for ${minion.name}`);
    if (!maxTiers[minion.generator] || minion.generator_tier > maxTiers[minion.generator]) {
      maxTiers[minion.generator] = minion.generator_tier;
    }
    console.info(`Got max tier for ${minion.name},\nprocessed ${index + 1}/${items.length}`);
  });

  items.forEach((minion, index) => {
    console.info(`Setting max tier for ${minion.name}`);
    minion.maxTier = maxTiers[minion.generator];
    console.info(`Set max tier for ${minion.name},\nprocessed ${index + 1}/${items.length}`);
  });

  async function fetchCraftCosts(minions: Minion[]) {
    try {
      console.info(`Getting craft costs for all minions`);
      const response = await fetch(`/api/craftcost/minions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const craftCosts = await response.json();
      minions.forEach((minion) => {
        console.info(`Setting craft cost for ${minion.id}`);
        minion.craftCost = craftCosts[minion.id];
        console.info(`Set craft cost for ${minion.id}: ${minion.craftCost}`);
      });
      console.info(`Got craft costs for all minions`);
    } catch (e) {
      console.error(e);
      throw new Error(`Failed to get craft costs for all minions`);
    }
  }

  try {
    // Fetch all skins and heads in parallel
    await Promise.all(items.map((minion) => fetchTexture(minion, "skin")));
    await Promise.all(items.map((minion) => fetchTexture(minion, "head")));
    await fetchCraftCosts(items);

    // Then perform the Prisma transaction
    await prisma.$transaction([
      prisma.minion.deleteMany(),
      prisma.minion.createMany({
        data: items.map((minion) => ({
          id: minion.id,
          name: minion.name,
          generator: minion.generator,
          generator_tier: minion.generator_tier,
          // @ts-ignore
          texture: minion.head,
          skin: minion.skin,
          maxTier: minion.maxTier,
          craftCost: minion.craftCost
        }))
      })
    ]);

    console.info("\n\nSuccessfully filled database with minions");

    return json(
      { success: true, message: "Successfully filled database with minions" },
      {
        status: 200,
        statusText: "Success"
      }
    );
  } catch (e) {
    console.error(e);
    return json(
      { success: false, message: "Failed to fill database with minions" },
      {
        status: 500,
        statusText: "Internal Server Error"
      }
    );
  }
};
