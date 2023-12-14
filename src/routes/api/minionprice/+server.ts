import type { RequestHandler } from "./$types";
const recipe = await (await fetch(`https://raw.githubusercontent.com/kr45732/skyblock-plus-data/main/InternalNameMappings.json`)).json();
const items = await (await fetch(`https://api.slothpixel.me/api/skyblock/bazaar`)).json();

function getRecipeItems(recipe: { [key: string]: string }) {
  const recipeItems: { [key: string]: number } = {};
  // remove duplicate items
  for (const item in recipe) {
    if (Object.values(recipe).filter((i) => i === recipe[item]).length > 1) {
      delete recipe[item];
    }
  }

  // remove all items with empty values
  for (const item in recipe) {
    if (recipe[item] === "") {
      delete recipe[item];
    }
  }

  // Replace every '-' with '_', except the last one if there is more than one '-'. Replace the last '-' with ':'
  for (const item in recipe) {
    const itemSplit = recipe[item].split("-");
    if (itemSplit.length > 1) {
      const lastElement = itemSplit.pop();
      recipe[item] = itemSplit.join("_") + ":" + lastElement;
    }
  }

  for (const item in recipe) {
    let itemID = recipe[item].split(":")[0];
    const itemAmount = recipe[item].split(":")[1];
    // console.log(`Getting recipe items for ${itemID}`);
    recipeItems[itemID] = Number(itemAmount);
  }

  return recipeItems;
}

let skipItems = ["FLOWER_GENERATOR_1", "SNOW_GENERATOR_1", "SPOOKY_HELMET"];

function getRecipeItemsPrices(recipeItems: { [key: string]: number }, pricingItems: Set<string> = new Set()) {
  const recipeItemsPrices: { [key: string]: number } = {};
  for (const item in recipeItems) {
    if (skipItems.includes(item)) continue;

    if (pricingItems.has(item)) {
      continue; // Skip items that are currently being priced to prevent infinite loops
    }
    pricingItems.add(item);
    let itemPrice;

    console.log(`Getting recipe items prices for ${item}`);
    console.log(items[item]);
    if (items[item]) {
      itemPrice = items[item].quick_status.sellPrice;
    } else {
      const itemRecipe = getRecipeItems(recipe[item].recipe);
      const itemRecipeItemsPrices = getRecipeItemsPrices(itemRecipe, pricingItems);
      itemPrice = addRecipeItemsPrices(itemRecipeItemsPrices);
    }
    recipeItemsPrices[item] = itemPrice;
    pricingItems.delete(item);
  }
  return recipeItemsPrices;
}

function multiplyRecipeItemsPrices(recipeItemsPrices: { [key: string]: number }, recipeItems: { [key: string]: number }) {
  const recipeItemsPricesMultiplied: { [key: string]: number } = {};
  for (const item in recipeItemsPrices) {
    recipeItemsPricesMultiplied[item] = recipeItemsPrices[item] * recipeItems[item];
  }
  return recipeItemsPricesMultiplied;
}

function addRecipeItemsPrices(recipeItemsPrices: { [key: string]: number }) {
  let recipeItemsPricesAdded = 0;
  for (const item in recipeItemsPrices) {
    recipeItemsPricesAdded += recipeItemsPrices[item];
  }
  return recipeItemsPricesAdded;
}

export const GET: RequestHandler = async () => {
  const minionPrices: { [key: string]: number } = {};
  const minions = await prisma.minion.findMany({
    select: {
      id: true
    },
    orderBy: {
      id: "asc"
    }
    // take: 1
  });
  // Then, for each minion, get the recipe from https://raw.githubusercontent.com/kr45732/skyblock-plus-data/main/InternalNameMappings.json
  // Example data:
  /*
    "ACACIA_GENERATOR_1": {
    "name": "Acacia Minion I",
    "recipe": {
      "A1": "LOG_2:10",
      "A2": "LOG_2:10",
      "A3": "LOG_2:10",
      "B1": "LOG_2:10",
      "B2": "WOOD_AXE:1",
      "B3": "LOG_2:10",
      "C1": "LOG_2:10",
      "C2": "LOG_2:10",
      "C3": "LOG_2:10"
    },
    "wiki": "https://wiki.hypixel.net/Acacia_Minion",
    "base_rarity": "RARE"
  },
  */
  // Then, for each recipe item, get the raw craft cost from the hypixel skyblock bazaar api using slothpixel api https://api.slothpixel.me/api/skyblock/bazaar/LOG_2
  // Example data:
  /*
{
  "product_id": "LOG_2",
    "quick_status": {
    "productId": "LOG_2",
    "sellPrice": 5.4,
    "sellVolume": 882356,
    "sellMovingWeek": 10466133,
    "sellOrders": 38,
    "buyPrice": 15.105951093737005,
    "buyVolume": 1390954,
    "buyMovingWeek": 2397359,
    "buyOrders": 266
  },
}
  */

  // Then, for each recipe item, get the total item cost by multiplying the amount of each item in the recipe by the cost of the item
  // Then, add all the item costs together to get the total minion cost

  for (const minion of minions) {
    // console.log(`Getting raw craft cost for ${minion.id}`);
    const minionRecipe = recipe[minion.id].recipe;

    const minionRecipeItems = getRecipeItems(minionRecipe);
    // console.log(minionRecipeItems);

    // Get the single price of each item in the recipe
    const minionRecipeItemsPrices = getRecipeItemsPrices(minionRecipeItems);
    // console.log(minionRecipeItemsPrices);

    // Multiply the single price of each item in the recipe by the amount of each item in the recipe
    const minionRecipeItemsPricesMultiplied = multiplyRecipeItemsPrices(minionRecipeItemsPrices, minionRecipeItems);
    // console.log(minionRecipeItemsPricesMultiplied);

    const minionTotalPrice = addRecipeItemsPrices(minionRecipeItemsPricesMultiplied);
    // console.log(minionTotalPrice);

    minionPrices[minion.id] = minionTotalPrice;
    // console.log(`Got raw craft cost for ${minion.id},\nprocessed ${minions.indexOf(minion) + 1}/${minions.length}`);
  }

  // return minionPrices;

  // return formatted json of minionPrices
  return new Response(JSON.stringify(minionPrices).replace(/,/g, ",\n  ").replace(/{/g, "{\n  ").replace(/}/g, "\n}"), {
    headers: {
      "content-type": "application/json;charset=UTF-8"
    }
  });
};
