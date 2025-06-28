import {
    checkRateLimit,
    createErrorResponse,
    createNotFoundResponse,
    createRateLimitResponse,
    createSuccessResponse,
    sanitizeString
} from "$lib/server/api-utils";
import type { RequestHandler } from "./$types";

interface Item {
  [key: string]: {
    name: string;
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
      count?: number;
    };
    wiki: string[];
  };
}

interface RecipeCost {
  [key: string]: number | undefined;
}

// Cache for external data
let allItems: Record<string, Item> | null = null;
let allItemPrices: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const nameMappingsUrl = "https://raw.githubusercontent.com/DarthGigi/MinionAH-NotEnoughUpdates-REPO/refs/heads/master/recipes/recipes.json";

/**
 * Fetch and cache external data
 */
async function fetchExternalData() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (allItems && (now - lastFetchTime) < CACHE_DURATION) {
    return { allItems, allItemPrices };
  }

  try {
    const [itemsResponse, itemsPriceResponse] = await Promise.all([
      fetch(nameMappingsUrl),
      fetch(`https://api.hypixel.net/v2/skyblock/bazaar`)
    ]);

    if (!itemsResponse.ok || !itemsPriceResponse.ok) {
      throw new Error(`Failed to fetch external data: ${itemsResponse.status} ${itemsPriceResponse.status}`);
    }

    allItems = await itemsResponse.json();
    const allItemPricesJson = await itemsPriceResponse.json();
    
    // Reset prices object
    allItemPrices = {};
    
    for (const [id, data] of Object.entries(allItemPricesJson.products as Record<string, { quick_status: { buyPrice: number } }>)) {
      allItemPrices[id] = data.quick_status.buyPrice;
    }

    lastFetchTime = now;
    return { allItems, allItemPrices };
  } catch (e) {
    console.error("Failed to fetch external data:", e);
    throw new Error("Failed to fetch external data");
  }
}

const recipeCost: Record<string, number> = {};

/**
 * Calculate recipe cost recursively
 */
const getRecipeCost = (recipeId: string, recipeIngredients: Item["recipe"]): number => {
  if (!recipeIngredients) return 0;
  
  let cost = 0;
  for (const [key, value] of Object.entries(recipeIngredients)) {
    const recipeString = value.toString();
    if (recipeString.length === 0 || key === "count") {
      continue;
    }

    const itemRecipeAmount = recipeIngredients.count ?? 1;
    const [id, currAmount] = recipeString.split(";") as [string, string];
    const amount = isNaN(parseInt(currAmount)) ? 1 : parseInt(currAmount);

    const itemPrice = allItemPrices[id] ?? 0;
    if (id === "SKYBLOCK_COIN") {
      cost += amount * itemRecipeAmount;
    } else if (itemPrice && amount) {
      cost += itemPrice * amount * itemRecipeAmount;
    } else {
      const itemRecipe = allItems?.[id];
      if (
        itemRecipe &&
        !Object.values(itemRecipe.recipe || {})
          .filter((x: any) => x.toString().length > 1)
          .every((x) => x === recipeId)
      ) {
        const recipeCost = getRecipeCost(id, itemRecipe.recipe);
        cost += recipeCost * amount * itemRecipeAmount;
      }
    }
  }

  recipeCost[recipeId] = Math.floor(cost);
  return Math.floor(cost);
};

/**
 * Calculate costs for all items in a set
 */
const getAllRecipeCost = (itemsSet: Record<string, Item>): RecipeCost => {
  const recipeCost: RecipeCost = {};

  for (const [item, data] of Object.entries(itemsSet)) {
    recipeCost[item] = getRecipeCost(item, data.recipe);
  }

  return Object.fromEntries(Object.entries(recipeCost).sort());
};

/**
 * Sort minions by type and tier
 */
const sortMinions = (items: RecipeCost): RecipeCost => {
  return Object.keys(items)
    .sort((a, b) => {
      const splitA = a.split("_");
      const splitB = b.split("_");
      const typeA = splitA.slice(0, -1).join("_");
      const typeB = splitB.slice(0, -1).join("_");
      const numA = parseInt(splitA.pop() as string);
      const numB = parseInt(splitB.pop() as string);

      if (typeA < typeB) return -1;
      if (typeA > typeB) return 1;
      return numA - numB;
    })
    .reduce((acc: { [key: string]: number }, key: string) => {
      acc[key] = items[key] ?? 0;
      return acc;
    }, {});
};

export const GET: RequestHandler = async ({ params, request }) => {
  try {
    // Rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp, 100, 60000)) { // 100 requests per minute
      return createRateLimitResponse();
    }

    // Validate parameters
    const { internalName } = params;
    if (!internalName) {
      return createErrorResponse("Missing internalName parameter", 400, "internalName is required", "MISSING_PARAMETER");
    }

    // Sanitize input
    const sanitizedInternalName = sanitizeString(internalName);

    // Fetch external data
    const { allItems: items, allItemPrices: prices } = await fetchExternalData();
    allItemPrices = prices;

    if (!items) {
      return createErrorResponse("Failed to fetch data", 500, "Unable to retrieve item data", "DATA_FETCH_ERROR");
    }

    // Determine filter
    const applyFilter = sanitizedInternalName === "minions" ? "_GENERATOR" : sanitizedInternalName;

    // Filter items
    const filteredItems: Record<string, Item> = Object.keys(items)
      .filter((key: string) => {
        if (!applyFilter) return true;
        return applyFilter === "_GENERATOR" ? key.includes(applyFilter) : key === applyFilter;
      })
      .reduce((acc: Record<string, Item>, key: string) => {
        acc[key] = items[key];
        return acc;
      }, {});

    // Calculate costs
    let result = getAllRecipeCost(filteredItems);

    // Return 404 if no items found
    if (Object.keys(result).length === 0) {
      return createNotFoundResponse(
        `Item '${sanitizedInternalName}'`,
        `The item '${sanitizedInternalName}' was not found. Please check the documentation for a list of all Hypixel Skyblock items.`
      );
    }

    // Sort minions if requested
    if (sanitizedInternalName === "minions") {
      result = sortMinions(result);
    }

    // Return success response
    return createSuccessResponse(result, `Successfully retrieved ${sanitizedInternalName} data`);

  } catch (e) {
    console.error("Craftcost API error:", e);
    return createErrorResponse(
      "Internal server error",
      500,
      "An error occurred while processing your request",
      "INTERNAL_ERROR"
    );
  }
};
