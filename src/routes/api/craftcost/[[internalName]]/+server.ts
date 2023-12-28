import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * The BaseItem interface represents a structure for an item object.
 * Each item object is a key-value pair where the key is a string and the value is an object.
 * The value object has the following properties:
 * - name: A string representing the name of the item.
 * - wiki: A string representing the wiki link for the item.
 * - base_rarity: A string representing the base rarity of the item.
 */
interface BaseItem {
  [key: string]: {
    name: string;
    wiki: string;
    base_rarity: string;
  };
}

/**
 * The CraftableItem interface extends the BaseItem interface.
 * Each craftable item is a key-value pair where the key is a string and the value is an object.
 * The value object has all the properties of a BaseItem, plus an optional recipe property.
 * The recipe property, if present, is an object with up to nine optional properties (A1 to C3).
 * Each of these properties represents a component of the recipe for crafting the item.
 */
interface CraftableItem extends BaseItem {
  [key: string]: BaseItem[keyof BaseItem] & {
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
  };
}

/**
 * The NPCItem interface extends the BaseItem interface.
 * Each NPC item is a key-value pair where the key is a string and the value is an object.
 * The value object has all the properties of a BaseItem, plus an optional npc_buy property.
 * The npc_buy property, if present, is an object with a cost property.
 * The cost property is an array of strings, each representing a cost at which the NPC can buy the item.
 */
interface NPCItem extends BaseItem {
  [key: string]: BaseItem[keyof BaseItem] & {
    npc_buy?: {
      cost: string[];
    };
  };
}

/**
 * The Item interface extends the BaseItem interface.
 * Each item is a key-value pair where the key is a string and the value is an object.
 * The value object has all the properties of a BaseItem, plus either a CraftableItem or an NPCItem, but not both.
 * This is represented by the union type (CraftableItem | NPCItem).
 * This means that an item can either be craftable (with a recipe) or can be bought from an NPC (with a npc_buy property), but not both.
 */
interface Item {
  [key: string]: BaseItem[keyof BaseItem] & (CraftableItem | NPCItem);
}

/**
 * Interface for RecipeCost.
 * This interface represents a dictionary where the key is a string and the value is a number or undefined.
 * The key represents the ingredient and the value represents the cost of that ingredient.
 */
interface RecipeCost {
  [key: string]: number | undefined;
}

// Declare variables to hold all items and their prices
let allItems: any;
let allItemPrices: any;
const nameMappingsUrl = "https://raw.githubusercontent.com/kr45732/skyblock-plus-data/main/InternalNameMappings.json";
try {
  // Fetch data from two APIs concurrently using Promise.all
  // The first API provides item names, the second one provides item prices
  const [itemsResponse, itemsPriceResponse] = await Promise.all([fetch(nameMappingsUrl), fetch(`https://api.slothpixel.me/api/skyblock/bazaar`)]);

  // Parse the JSON responses to get the actual data
  allItems = await itemsResponse.json();
  allItemPrices = await itemsPriceResponse.json();
} catch (e) {
  // Log the error and throw a new one if any of the fetch operations fail
  console.error("Failed to fetch data:", e);
  error(500, "Failed to fetch data");
}

// Declare a record to store the cost of each recipe
const recipeCost: Record<string, number> = {};

// Define a function to get the ingredients of a recipe
const getRecipeIngredients = (recipeData: BaseItem & (CraftableItem | NPCItem)): { [key: string]: number } => {
  // Declare an object to store the ingredients of the recipe
  const recipeIngredients: { [key: string]: number } = {};

  // Check if recipeData is an array, if not, convert its values to an array
  // This is to handle both data.recipe and data.npc_buy.cost
  const recipeDataValues = Array.isArray(recipeData) ? recipeData : Object.values(recipeData);

  // Loop through each slot data in the recipe data values
  for (const slotdata of recipeDataValues) {
    // Make sure the slot data is a string (there might be a number that doesn't mean anything)
    if (typeof slotdata === "string") {
      // Split the slot data into item and amount
      const [item, amount] = slotdata.split(":");
      // Replace "-" in the item name with ":"
      const filterdItem = item.replace("-", ":");

      // If the item is already in recipeIngredients, add the current amount to its value
      // Otherwise, set its value to the current amount
      recipeIngredients[filterdItem] = recipeIngredients[filterdItem] ? recipeIngredients[filterdItem] + Number(amount) : Number(amount);
    }
  }

  // Return the recipe ingredients
  return recipeIngredients;
};

// Define a function to calculate the cost of a recipe
const getRecipeCost = (recipeName: string, recipeIngredients: { [key: string]: number }) => {
  // Initialize cost to 0
  let cost = 0;

  // Loop through each ingredient in the recipe
  for (const [item, amount] of Object.entries(recipeIngredients)) {
    // Try to get the price of the item from the already calculated recipe costs or from the bazaar
    // This is done first to avoid an infinite loop
    const itemPrice = recipeCost[item] || allItemPrices[item]?.quick_status?.buyPrice;

    // If the item price is found, add the total cost of the item to the total cost
    if (itemPrice) {
      cost += itemPrice * amount;
    }
    // If the item is a "SKYBLOCK_COIN", add the amount directly to the cost
    else if (item === "SKYBLOCK_COIN") {
      cost += amount;
    }
    // If the item price is not found in the bazaar, check if the item has a recipe
    // If it does, calculate the cost of that recipe and add it to the total cost
    else {
      const itemRecipe = allItems[item];
      const recipeData = itemRecipe?.recipe || itemRecipe?.npc_buy?.cost;
      if (recipeData) {
        const recipeIngredients = getRecipeIngredients(recipeData);
        cost += getRecipeCost(item, recipeIngredients);
      }
    }
  }

  // Store the calculated cost of the recipe for quick access in the future
  recipeCost[recipeName] = cost;

  // Return the total cost of the recipe
  return cost;
};

// Function to calculate the cost of all recipes
const getAllRecipeCost = (itemsSet: Record<string, Item>) => {
  // Initialize an empty object to store the cost of each recipe
  const recipeCost: RecipeCost = {};

  // Loop over each item in the itemsSet
  for (const [item, data] of Object.entries(itemsSet)) {
    // Get the recipe data for the item, or the cost if it can be bought from an NPC
    const recipeData = data.recipe || data.npc_buy?.cost;
    // If recipe data exists for the item
    if (recipeData) {
      // Calculate the cost of the recipe and store it in the recipeCost object
      recipeCost[item] = getRecipeCost(item, getRecipeIngredients(recipeData));
    } else {
      // Otherwise, set the cost to 0
      recipeCost[item] = 0;
    }
  }

  // Return the object containing the cost of each recipe
  return recipeCost;
};

export const GET: RequestHandler = async ({ params }) => {
  // Extract the internalName from the request parameters
  const { internalName } = params;

  // Initialize a variable to hold the filter to be applied
  let applyFilter: string | undefined = undefined;

  // If the internalName is "minions", set the filter to "GENERATOR"
  if (internalName === "minions") {
    applyFilter = "GENERATOR";
  } else {
    // Otherwise, set the filter to the internalName
    applyFilter = internalName;
  }

  try {
    // Create a new items object, filtering the keys of allItems based on the applyFilter
    // and reducing to a new object with the filtered keys and their corresponding values
    const items: Record<string, Item> = Object.keys(allItems)
      .filter((key: string) => (applyFilter ? (applyFilter === "GENERATOR" ? key.includes(applyFilter) : key === applyFilter) : true))
      .reduce((acc: Record<string, Item>, key: string) => {
        acc[key] = allItems[key];
        return acc;
      }, {});

    // Get the cost of all recipes for the filtered items
    let item = getAllRecipeCost(items);

    // If the item object is empty, return a 404 response with an error message
    if (Object.keys(item).length === 0) {
      return new Response(JSON.stringify({ error: `Item not found`, message: `The item '${internalName}' was not found. Please check 'InternalNameMappings.json' for a list of all Hypixel Skyblock items. Consult the documentation for more information: https://minionah.com/api/craftcost/docs.`, item: internalName, url: nameMappingsUrl }, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Cache-Control": "max-age=3600"
        },
        status: 404,
        statusText: "Item not found"
      });
    }

    if (internalName === "minions") {
      // Sort and restructurt the items object
      item = Object.keys(item)
        // Sort the keys of the items object
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
          acc[key] = item[key];
          // Return the accumulator for the next iteration
          return acc;
        }, {});
    }

    // If the item object is not empty, return a 200 response with the item data
    return new Response(JSON.stringify(item, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "max-age=3600"
      },
      status: 200,
      statusText: "OK"
    });
  } catch (e) {
    // If an error occurs, log the error and return a 500 response with an error message
    console.error("Something went wrong", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Cache-Control": "max-age=3600"
      },
      status: 500,
      statusText: "Internal Server Error"
    });
  }
};
