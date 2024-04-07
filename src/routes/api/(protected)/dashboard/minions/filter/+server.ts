import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async () => {
  const itemsList = await fetch("https://api.slothpixel.me/api/skyblock/items");
  const items = await itemsList.json();

  // convert to array so we can use .filter
  const itemsArray = Object.values(items);

  // Filter items so that only minions are returned, only minions have generator_tier
  const minions = itemsArray.filter((item: any) => item.generator_tier);

  // Sort minions first by name, then by tier so that the order is correct
  minions.sort((a: any, b: any) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    if (a.generator_tier < b.generator_tier) return -1;
    if (a.generator_tier > b.generator_tier) return 1;

    return 0;
  });

  // give back a .json file
  return json(minions);
};
