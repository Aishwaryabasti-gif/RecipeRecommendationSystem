import { GoogleGenAI, Type, Modality } from "@google/genai";
import { UserPreferences, Recommendation, NearbyStore } from '../types';

// Define a type for the recipe details without the image
type RecipeDetails = Omit<Recommendation, 'imageBase64'>;

const getFoodRecommendations = async (preferences: UserPreferences): Promise<Recommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const ingredientsProvided = preferences.includeIngredients.length > 0;

  // --- Step 1: Get recipe details (text only) ---
  const recipePrompt = `
    You are a strict "Pantry Chef" AI. Your ONLY goal is to create recipes using a fixed list of ingredients and adhering to dietary rules.
    
    **PRIMARY DIRECTIVE: YOU MUST ONLY USE THE INGREDIENTS PROVIDED IN THE 'Ingredients Available' LIST. DO NOT, UNDER ANY CIRCUMSTANCES, ADD ANY INGREDIENT THAT IS NOT ON THIS LIST.**
    This includes common items like oil, salt, pepper, spices, water, etc. If it is not on the list, you cannot use it. Assume the user's pantry is completely empty except for the items listed.

    **SECOND DIRECTIVE: YOU MUST STRICTLY ADHERE to the user's 'Dietary Restrictions'. This is a non-negotiable rule.**
    - If the restriction is 'Vegetarian', you MUST NOT include any meat, poultry, or fish.
    - If the restriction is 'Vegan', you MUST NOT include any animal products whatsoever, including meat, dairy, eggs, and honey.
    - If the restriction is 'Non-Veg', you should prioritize meat-based dishes.

    User Preferences:
    - Cuisine: ${preferences.cuisine || 'Any'}
    - Dietary Restrictions: ${preferences.dietaryRestrictions || 'None'}
    - Ingredients Available: ${ingredientsProvided ? preferences.includeIngredients.join(', ') : 'User has not specified any ingredients, suggest popular dishes.'}

    Your task is to recommend 3 dishes. For each dish:
    - It must be possible to make it using ONLY a subset of the 'Ingredients Available'.
    - It MUST strictly follow the 'Dietary Restrictions'.
    - The list of ingredients in your response for each dish must also ONLY contain items from the 'Ingredients Available' list.

    **FINAL WARNING:** Failure to adhere to EITHER the ingredient constraint OR the dietary constraint is a failure to complete the task. Review your output carefully.

    Provide the response in a JSON array format.
  `;

  let recipeDetails: RecipeDetails[];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: recipePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dishName: {
                type: Type.STRING,
                description: "The name of the recommended dish.",
              },
              description: {
                type: Type.STRING,
                description: "A short, enticing description of the dish.",
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "A list of key ingredients for the dish. CRITICAL: Every ingredient in this list MUST come from the user's provided 'Ingredients Available' list.",
              },
            },
            required: ["dishName", "description", "ingredients"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      throw new Error("API returned empty recipe details.");
    }
    
    recipeDetails = JSON.parse(jsonText);

  } catch (error) {
    console.error("Error fetching recipe details:", error);
    throw new Error("Failed to get recipe details from Gemini API.");
  }

  // --- Step 2: Generate an image for each recipe in parallel ---
  const imageGenerationPromises = recipeDetails.map(async (recipe) => {
    const dietaryContext = preferences.dietaryRestrictions && preferences.dietaryRestrictions !== 'None' && preferences.dietaryRestrictions !== 'Any'
      ? `**DIET**: This is a **${preferences.dietaryRestrictions}** dish.`
      : '';

    const imagePrompt = `
      You are an expert food photographer AI. Your task is to generate a photorealistic image for a specific dish, paying extremely close attention to the provided context to avoid mistakes.

      **Dish Name**: "${recipe.dishName}"
      **Description**: ${recipe.description}

      **CRITICAL CONTEXT - YOU MUST FOLLOW THESE RULES:**
      1.  ${dietaryContext} The image MUST strictly adhere to this diet. For example, a vegetarian dish MUST NOT contain any meat or fish.
      2.  **INGREDIENTS**: The key ingredients in this recipe are: **${recipe.ingredients.join(', ')}**. You MUST use this list to resolve any ambiguity in the dish name.
      
      **Example of avoiding ambiguity**: If the dish name is "Drumstick Masala Rice", the diet is "Vegetarian", and the ingredients include "moringa (drumstick vegetable)", you MUST generate an image of the VEGETABLE dish, not a chicken dish. The ingredient list is your source of truth.

      **Final Image Instructions**:
      - The photograph must be vibrant, photorealistic, and professionally shot.
      - The dish should be presented beautifully on a plate, looking delicious and ready to eat.
      - Centered, detailed, high resolution.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            return part.inlineData.data; // This is the base64 string
          }
        }
      }
      
      const reason = candidate?.finishReason || 'Unknown';
      const safetyRatings = JSON.stringify(candidate?.safetyRatings || [], null, 2);
      console.error(`Image generation failed for "${recipe.dishName}". Reason: ${reason}. Safety Ratings: ${safetyRatings}. Full API response:`, JSON.stringify(response, null, 2));
      throw new Error(`No image data returned for ${recipe.dishName}. The request may have been blocked due to safety settings (Reason: ${reason}).`);
    } catch (error) {
      console.error(`Error generating image for ${recipe.dishName}:`, error);
      throw new Error(`Failed to generate an image for ${recipe.dishName}.`);
    }
  });

  try {
    const base64Images = await Promise.all(imageGenerationPromises);
    
    // --- Step 3: Combine recipe details with generated images ---
    const fullRecommendations: Recommendation[] = recipeDetails.map((recipe, index) => ({
      ...recipe,
      imageBase64: base64Images[index],
    }));

    return fullRecommendations;

  } catch (error) {
     console.error("Error during image generation process:", error);
     throw new Error("Failed to generate images for the recommendations. Please try again.");
  }
};

export const getFullRecipe = async (dishName: string, description: string, preferences: UserPreferences): Promise<Pick<Recommendation, 'ingredients' | 'instructions'>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const ingredientsProvided = preferences.includeIngredients.length > 0;
  
  const prompt = `
    You are a strict "Pantry Chef" AI. Your ONLY goal is to create a detailed recipe using a fixed list of ingredients and adhering to dietary rules.

    **PRIMARY DIRECTIVE: YOU MUST ONLY USE THE INGREDIENTS PROVIDED IN THE 'Available Ingredients' LIST. DO NOT, UNDER ANY CIRCUMSTANCES, ADD ANY INGREDIENT THAT IS NOT ON THIS LIST.**
    This includes common items like oil, salt, pepper, spices, water, etc. If it is not on the list, you cannot use it.

    **SECOND DIRECTIVE: YOU MUST STRICTLY ADHERE to the user's 'Dietary Restrictions'. This is a non-negotiable rule.**
    - If the restriction is 'Vegetarian', you MUST NOT include any meat, poultry, or fish.
    - If the restriction is 'Vegan', you MUST NOT include any animal products whatsoever, including meat, dairy, eggs, and honey.
    - If the restriction is 'Non-Veg', you should prioritize meat-based dishes.

    Dish Name: ${dishName}
    Description: ${description}
    Dietary Restrictions: ${preferences.dietaryRestrictions || 'None'}
    Available Ingredients: ${ingredientsProvided ? preferences.includeIngredients.join(', ') : 'Any common ingredients can be used.'}

    Your task is to provide:
    1. **ingredients**: A list of all ingredients used from the available list, with precise quantities. Every single ingredient here MUST be from the 'Available Ingredients' list and must conform to the dietary restriction.
    2. **instructions**: A step-by-step list of cooking instructions. The instructions must not mention or imply the use of any ingredient not on the 'Available Ingredients' list or that violates the dietary restriction.

    **FINAL WARNING:** Failure to adhere to EITHER the ingredient constraint OR the dietary constraint is a failure to complete the task. Review your output carefully.

    Provide the response in a JSON format.
  `;

  try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of ingredients with quantities. CRITICAL: Every ingredient in this list MUST come from the user's provided 'Available Ingredients' list and adhere to the dietary restriction.",
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Step-by-step cooking instructions. Must adhere to all constraints.",
              },
            },
            required: ["ingredients", "instructions"],
          },
        },
      });

      const jsonText = response.text.trim();
      if (!jsonText) {
        throw new Error("API returned empty recipe content.");
      }
      return JSON.parse(jsonText);
  } catch (error) {
    console.error(`Error fetching full recipe for ${dishName}:`, error);
    throw new Error(`Failed to generate a full recipe for ${dishName}.`);
  }
};


export const getNearbyStores = async (latitude: number, longitude: number): Promise<NearbyStore[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const prompt = "Find nearby grocery stores or supermarkets where I can buy ingredients.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: latitude,
                            longitude: longitude
                        }
                    }
                }
            },
        });

        console.log("Gemini API Response for Nearby Stores:", JSON.stringify(response, null, 2));

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (!chunks || chunks.length === 0) {
            console.warn("No grounding chunks found for nearby stores. The API might have returned a text-only answer or no results.");
            console.log("Text response from API:", response.text);
            return [];
        }

        const stores: NearbyStore[] = chunks
            .map(chunk => chunk.maps)
            .filter((maps): maps is { title: string; uri: string } => !!(maps && maps.uri && maps.title))
            .map(maps => ({
                name: maps.title,
                uri: maps.uri,
            }));
        
        if (stores.length === 0) {
            console.warn("Grounding chunks were found, but none contained valid Maps data.");
            return [];
        }

        const uniqueStores = Array.from(new Map(stores.map(s => [s.uri, s])).values());
        return uniqueStores.slice(0, 5);

    } catch (error) {
        console.error("Error fetching nearby stores from Gemini API:", error);
        throw new Error("Failed to find nearby stores.");
    }
};


export { getFoodRecommendations };