import * as cheerio from "cheerio";

export type ExtractedRecipe = {
  title: string;
  description?: string;
  imageUrl?: string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  category?: string;
  ingredients: {
    quantity: string | null;
    unit: string | null;
    name: string;
    note: string | null;
  }[];
  steps: {
    instruction: string;
  }[];
};

/**
 * Parses an ISO 8601 duration string like "PT30M", "PT1H", "PT1H30M"
 * and returns the duration in minutes.
 */
function parseISODuration(
  duration: string | undefined | null,
): number | undefined {
  if (!duration) return undefined;

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?/;
  const matches = duration.match(regex);

  if (!matches) return undefined;

  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);

  return hours * 60 + minutes;
}

/**
 * Tries to make sense of an ingredient string.
 * Example: "200 g de chocolat noir" -> { quantity: "200", unit: "g", name: "chocolat noir" }
 */
function parseIngredientString(ingredientStr: string) {
  const defaultResult = {
    quantity: null as string | null,
    unit: null as string | null,
    name: ingredientStr.trim(),
    note: null as string | null,
  };

  if (!ingredientStr) return defaultResult;

  // Cleanup HTML entities that might be present
  const cleanStr = ingredientStr
    .replace(/&nbsp;/g, " ")
    .replace(/&#160;/g, " ")
    .trim();

  // Common units in French recipes
  const unitRegexOptions = [
    "g",
    "kg",
    "mg",
    "ml",
    "cl",
    "dl",
    "l",
    "litre",
    "litres",
    "c.à.s",
    "c. à s.",
    "cuillère à soupe",
    "cuillères à soupe",
    "cas",
    "c.à.c",
    "c. à c.",
    "cuillère à café",
    "cuillères à café",
    "cac",
    "pincée",
    "pincées",
    "tranche",
    "tranches",
    "gousse",
    "gousses",
    "feuille",
    "feuilles",
    "botte",
    "bottes",
    "sachet",
    "sachets",
    "boîte",
    "boites",
    "tasse",
    "tasses",
    "verre",
    "verres",
    "zeste",
    "zestes",
    "filet",
    "filets",
    "branche",
    "branches",
  ];

  // Regex breakdown:
  // ^\s* : optional leading space
  // ([\d\.,\/½⅓⅔¼¾]+) : quantity (numbers, decimals, common fractions)
  // \s* : optional space between qty and unit
  // (unite_1|unite_2|...)? : optional unit
  // \s*(?:de|d'|du|des)?\s* : optional "de", "d'", "du", "des" followed by spaces
  // (.*)$ : the rest of the string is the ingredient name

  const unitPattern = unitRegexOptions
    .map((u) => u.replace(/\./g, "\\."))
    .join("|");
  const regex = new RegExp(
    `^\\s*([\\d\\.,\\/½⅓⅔¼¾]+)?\\s*(${unitPattern})?\\s*(?:de\\s+|d'|du\\s+|des\\s+)?(.*)$`,
    "i",
  );

  const match = cleanStr.match(regex);

  if (!match) return defaultResult;

  const quantityStr = match[1]?.trim();
  const unitStr = match[2]?.trim();
  let nameStr = match[3]?.trim();

  if (!nameStr) {
    if (unitStr) {
      nameStr = unitStr;
    } else if (quantityStr) {
      nameStr = quantityStr;
    } else {
      nameStr = cleanStr; // Fallback
    }
    return { ...defaultResult, name: nameStr };
  }

  // Convert fractional chars to numbers if possible or keep as string
  let quantity = quantityStr || null;
  if (quantity) {
    quantity = quantity.replace(",", "."); // Normalize decimal separator
  }

  // Handle unit normalization
  let unit = unitStr?.toLowerCase() || null;
  if (unit) {
    if (unit.match(/cuillère à soupe|c\.à\.s|c\. à s\.|cas/i)) unit = "c.à.s";
    if (unit.match(/cuillère à café|c\.à\.c|c\. à c\.|cac/i)) unit = "c.à.c";
  }

  return {
    quantity,
    unit,
    name: nameStr,
    note: null, // Basic parsing doesn't handle notes well, could be improved.
  };
}

interface SchemaOrgRecipe {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[] | { url: string } | { url: string }[];
  prepTime?: string;
  cookTime?: string;
  recipeYield?: string | number | string[];
  recipeIngredient?: string[];
  recipeInstructions?: string | { text?: string; name?: string }[];
  recipeCategory?: string | string[];
}

export async function extractRecipeData(
  url: string,
): Promise<ExtractedRecipe | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Try to find LD-JSON (Schema.org)
    const jsonLdScripts = $('script[type="application/ld+json"]').toArray();

    let recipeData: SchemaOrgRecipe | null = null;

    for (const script of jsonLdScripts) {
      try {
        const content = $(script).html();
        if (!content) continue;

        const jsonData = JSON.parse(content);

        // Schema.org can be a single object or an array of objects
        const items = Array.isArray(jsonData)
          ? jsonData
          : jsonData["@graph"]
            ? jsonData["@graph"]
            : [jsonData];

        for (const item of items) {
          if (
            item["@type"] === "Recipe" ||
            (Array.isArray(item["@type"]) && item["@type"].includes("Recipe"))
          ) {
            recipeData = item;
            break;
          }
        }

        if (recipeData) break;
      } catch (e) {
        console.error("Error parsing LD-JSON script:", e);
      }
    }

    if (!recipeData) {
      console.warn("No Schema.org Recipe data found in LD-JSON");
      return null;
    }

    // --- Extracted Data ---

    const title = recipeData.name || "Recette sans titre";
    const description = recipeData.description;

    let imageUrl = undefined;
    if (recipeData.image) {
      if (typeof recipeData.image === "string") {
        imageUrl = recipeData.image;
      } else if (
        Array.isArray(recipeData.image) &&
        recipeData.image.length > 0
      ) {
        const firstImg = recipeData.image[0];
        imageUrl =
          typeof firstImg === "string"
            ? firstImg
            : ((firstImg as Record<string, unknown>).url as string);
      } else if ((recipeData.image as Record<string, unknown>).url) {
        imageUrl = (recipeData.image as Record<string, unknown>).url as string;
      }
    }

    const prepTimeMinutes = parseISODuration(
      recipeData.prepTime as string | undefined,
    );
    const cookTimeMinutes = parseISODuration(
      recipeData.cookTime as string | undefined,
    );
    let servings: number | undefined = undefined;
    if (recipeData.recipeYield) {
      // It can be "4 servings" or just "4" or an array
      const yieldStr = Array.isArray(recipeData.recipeYield)
        ? recipeData.recipeYield[0]
        : recipeData.recipeYield;
      const match = String(yieldStr).match(/(\d+)/);
      if (match) {
        servings = parseInt(match[1], 10);
      }
    }

    // Ingredients
    const rawIngredients: string[] =
      (recipeData.recipeIngredient as string[]) || [];
    const ingredients = rawIngredients.map(parseIngredientString);

    // Instructions
    let steps: { instruction: string }[] = [];
    if (recipeData.recipeInstructions) {
      const rawSteps = recipeData.recipeInstructions;
      if (Array.isArray(rawSteps)) {
        steps = rawSteps
          .map((step) => {
            let text = "";
            if (typeof step === "string") text = step;
            else if ((step as Record<string, unknown>).text)
              text = (step as Record<string, unknown>).text as string;
            else if ((step as Record<string, unknown>).name)
              text = (step as Record<string, unknown>).name as string;

            // Remove HTML tags that might be inside instructions
            return { instruction: text.replace(/<[^>]*>?/gm, "").trim() };
          })
          .filter((s) => s.instruction.length > 0);
      } else if (typeof rawSteps === "string") {
        // Sometimes it's a single string with newlines or raw HTML
        steps = rawSteps
          .split(/<br\s*\/?>|\n/)
          .map((s) => s.replace(/<[^>]*>?/gm, "").trim())
          .filter((s) => s.length > 0)
          .map((s) => ({ instruction: s }));
      }
    }

    // Category
    let category: string | undefined = undefined;
    if (recipeData.recipeCategory) {
      const catStr = Array.isArray(recipeData.recipeCategory)
        ? recipeData.recipeCategory[0]
        : recipeData.recipeCategory;
      const catLower = catStr.toLowerCase();

      if (
        catLower.includes("entrée") ||
        catLower.includes("starter") ||
        catLower.includes("appetizer")
      ) {
        category = "Entrée";
      } else if (catLower.includes("dessert") || catLower.includes("sweet")) {
        category = "Dessert";
      } else if (catLower.includes("plat") || catLower.includes("main")) {
        category = "Plat principal";
      }
    }

    // Difficulty is often not in LD-JSON or under different names, so we can try to find it in HTML as fallback
    let difficulty: "EASY" | "MEDIUM" | "HARD" | undefined = undefined;
    const htmlLower = html.toLowerCase();

    if (htmlLower.includes("facile") || htmlLower.includes("très facile")) {
      difficulty = "EASY";
    } else if (htmlLower.includes("difficile")) {
      difficulty = "HARD";
    } else if (
      htmlLower.includes("moyen") ||
      htmlLower.includes("niveau moyen")
    ) {
      difficulty = "MEDIUM";
    }

    return {
      title,
      description,
      imageUrl,
      prepTimeMinutes,
      cookTimeMinutes,
      servings,
      difficulty,
      category,
      ingredients,
      steps,
    };
  } catch (error) {
    console.error("Error extracting recipe:", error);
    return null;
  }
}
