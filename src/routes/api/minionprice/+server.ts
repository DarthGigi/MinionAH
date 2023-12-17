import type { RequestHandler } from "./$types";
import { CRON_SECRET } from "$env/static/private";
import { error } from "@sveltejs/kit";

type Minion = {
  [key: string]: {
    name: string;
    wiki: string;
    base_rarity: string;
    recipe?: {
      A1?: string;
      A2?: string;
      A3?: string;
      B1?: string;
      B2?: string;
      B3?: string;
      C1?: string;
      C2?: string;
      C3?: string;
    };
    npc_buy?: {
      cost: string[];
    };
  };
};

interface MinionPrices {
  [key: string]: {
    recipeIngredients: { [key: string]: number };
    cost?: number;
  };
}

let allItems: any;
let allItemPrices: any;
try {
  /**
   * Fetches the items response and items price response from the specified URLs.
   *
   * @returns A promise that resolves to an array containing the items response and items price response.
   */
  const [itemsResponse, itemsPriceResponse] = await Promise.all([fetch(`https://raw.githubusercontent.com/kr45732/skyblock-plus-data/main/InternalNameMappings.json`), fetch(`https://api.slothpixel.me/api/skyblock/bazaar`)]);

  allItems = await itemsResponse.json();
  allItemPrices = await itemsPriceResponse.json();
} catch (e) {
  console.error("Failed to fetch data:", e);
  throw error(500, "Failed to fetch data");
}

/**
 * Filters the items in allItems to include only those with "GENERATOR" in their key,
 * and creates a new object with the filtered items.
 * @param {Object} allItems - The object containing all items.
 * @returns {Minion} The collection of minions.
 */
const minions: Minion = Object.keys(allItems)
  .filter((key) => key.includes("GENERATOR"))
  .reduce((acc: Minion, key) => {
    acc[key] = allItems[key];
    return acc;
  }, {});

/**
 * Calculates the prices of minions based on their recipes and item costs.
 *
 * @param minionSet - The set of minions to calculate prices for.
 * @returns An object containing the calculated minion prices.
 */
const getMinionPrices = (minionSet: Minion) => {
  let minionPrices: MinionPrices = {};

  // loop through all the minions
  for (const [minion, data] of Object.entries(minionSet)) {
    // create an object to store the recipe ingredients
    const recipeIngredients: { [key: string]: number } = {};

    // assign an object with recipeIngredients to the current minion in minionPrices
    minionPrices[minion] = {
      recipeIngredients: recipeIngredients
    };

    // loop through all the recipe ingredients or the cost of the recipe or the cost of the npc_buy if one of them exists
    for (const [_, slotdata] of Object.entries(data.recipe || data.npc_buy?.cost || {})) {
      // split the slot data into item and amount
      const [item, amount] = slotdata.split(":");
      // replace - with : in the item name to match the item name format
      const filterdItem = item.replace("-", ":");

      // if the item is already in the recipe ingredients, add the current amount to the existing value
      // if the item is not in the recipe ingredients, set its value to the current amount
      recipeIngredients[filterdItem] = recipeIngredients[filterdItem] ? recipeIngredients[filterdItem] + Number(amount) : Number(amount);
    }
  }

  // Create a sorted list from the keys of the minionPrices object
  const sortedList = Object.keys(minionPrices).sort((a, b) => {
    // Split the key string on underscore and get the last element, then parse it to an integer
    const numA = parseInt(a.split("_").pop() as string);
    // Do the same for the second key
    const numB = parseInt(b.split("_").pop() as string);
    // Subtract the two numbers to determine the sort order
    return numA - numB;
  });

  // Initialize an object to serve as a cache. This object will store minion names as keys and their corresponding costs as values.
  // The purpose of this cache is to avoid redundant calculations or lookups for the cost of minions that have already been processed.
  const cachedMinion: { [key: string]: number } = {};

  // Loop through all minions in the sorted list
  for (const minion of sortedList) {
    // Get the recipe ingredients for the current minion
    const ingredients = minionPrices[minion].recipeIngredients;
    // Initialize a variable to hold the total cost of the ingredients
    let total = 0;
    // Loop through each ingredient and its amount
    for (const [item, amount] of Object.entries(ingredients)) {
      // If the ingredient is another minion, its cost should already be calculated due to the sorted list, so add that cost to the total
      if (item in cachedMinion) {
        total += cachedMinion[item];
      }
      // If the ingredient is not another minion, find its price in the bazaar
      else {
        let itemPrice: number;
        // If the item is a Skyblock coin, its value is 1
        if (item === "SKYBLOCK_COIN") {
          itemPrice = 1;
        } else {
          // Otherwise, get the buy price from the allItemPrices object
          itemPrice = allItemPrices[item]?.quick_status?.buyPrice;
        }
        // If the item price exists, add the total cost of the ingredient to the total
        if (itemPrice) {
          total += itemPrice * Number(amount);
        } else {
          // If the item price does not exist, that means the item is not in the bazaar, but it may be purchasable from an NPC. So get its cost from the npc_buy object
          allItems[item]?.npc_buy?.cost?.forEach((item: { split: (arg0: string) => [any, any] }) => {
            const [itemID, itemAmount] = item.split(":");
            // If the item is a Skyblock coin, add its amount to the total
            if (itemID === "SKYBLOCK_COIN") {
              total += Number(itemAmount) * Number(amount);
            }
          });
        }
      }
    }

    // Add the total cost of the current minion to the cachedMinion object for future reference
    cachedMinion[minion] = total;

    // Update the cost of the current minion in the minionPrices object
    minionPrices[minion].cost = total;
  }

  // Return the minionPrices object sorted and restructured
  return (minionPrices = Object.keys(minionPrices)
    // Sort the keys of the minionPrices object
    .sort((a, b) => {
      // Split each key into parts by underscore
      const splitA = a.split("_");
      const splitB = b.split("_");
      // Join all parts except the last one to get the type of minion
      const typeA = splitA.slice(0, -1).join("_");
      const typeB = splitB.slice(0, -1).join("_");
      // Parse the last part of each key to get the number of the minion
      const numA = parseInt(splitA.pop() as string);
      const numB = parseInt(splitB.pop() as string);

      // Compare the types of minions. If they are different, sort by type
      if (typeA < typeB) return -1;
      if (typeA > typeB) return 1;
      // If the types are the same, sort by number
      return numA - numB;
    })
    // Reduce the sorted keys into a new object with the same structure as minionPrices
    .reduce((acc: { [key: string]: any }, key) => {
      // Add each key-value pair to the accumulator object
      acc[key] = minionPrices[key];
      // Return the accumulator for the next iteration
      return acc;
    }, {}));
};

export const GET: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  const minionPrices = getMinionPrices(minions);
  // Results:
  /*
  {
    "ACACIA_GENERATOR_1": {
"recipeIngredients": {
"LOG_2": 80,
"WOOD_AXE": 1
},
"cost": 1132.3052837573387
},
...etc
  }
  */

  const test = Object.entries(minionPrices).map(([key, value]) => ({
    where: {
      name: key
    },
    data: {
      cost: value.cost
    }
  }));

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    // for (const [key, value] of Object.entries(minionPrices)) {
    //   await prisma.minion.update({
    //     where: {
    //       id: key
    //     },
    //     data: {
    //       craftCost: value.cost
    //     }
    //   });
    // }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    });
  }

  // Call the getMinionPrices function with the minions data as argument
  // The function returns an object with minion prices
  // Convert the object to a JSON string
  // Return a new Response object with the JSON string as body
  return new Response(JSON.stringify(minionPrices), {
    // Set the content-type header to "application/json"
    headers: {
      "content-type": "application/json"
    }
  });
};
