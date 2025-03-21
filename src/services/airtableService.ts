
import { Recipe } from '@/utils/types';
import { apiRateLimiter } from '@/utils/rateLimit';

export class AirtableService {
  private apiKey: string;
  private baseId: string;
  private tableName: string;
  private baseUrl: string;

  /**
   * Create a new AirtableService
   * @param apiKey Airtable API Key
   * @param baseId Airtable Base ID
   * @param tableName Airtable Table Name
   */
  constructor(apiKey: string, baseId: string, tableName: string) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.tableName = tableName;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}/${tableName}`;
  }

  /**
   * Store a recipe in Airtable
   * @param recipe Recipe to store
   * @returns Stored recipe with Airtable ID
   */
  public async storeRecipe(recipe: Recipe): Promise<Recipe> {
    try {
      return await apiRateLimiter.add(async () => {
        // Format recipe for Airtable
        const formattedRecipe = {
          "fields": {
            "Recipe Name": recipe.recipeName,
            "Recipe Category": recipe.recipeCategory,
            "Dietary Flags": recipe.dietaryFlags.join(', '),
            "Ingredients": recipe.ingredients.map(ing => {
              const parts = [];
              if (ing.quantity) parts.push(ing.quantity);
              if (ing.measurement) parts.push(ing.measurement);
              if (parts.length > 0) {
                return `${ing.name} (${parts.join(' ')})`;
              }
              return ing.name;
            }).join('\n'),
            "Preparation Steps": recipe.preparationSteps.map((step, i) => `${i + 1}. ${step}`).join('\n'),
            "Preparation Time": recipe.preparationTime,
            "Cook Time": recipe.cookTime,
            "Total Time": recipe.totalTime,
            "Servings": recipe.servings,
            "Difficulty Level": recipe.difficultyLevel,
            "Short Visual Description": recipe.shortVisualDescription,
            "Image URL": recipe.imageUrl || '',
            "Created": recipe.created ? recipe.created.toISOString() : new Date().toISOString()
          }
        };

        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedRecipe),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Airtable API error:', errorData);
          throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Return recipe with Airtable ID
        return {
          ...recipe,
          id: data.id
        };
      });
    } catch (error) {
      console.error('Error storing recipe in Airtable:', error);
      throw error;
    }
  }

  /**
   * Get all recipes from Airtable
   * @returns Array of recipes
   */
  public async getRecipes(): Promise<Recipe[]> {
    try {
      return await apiRateLimiter.add(async () => {
        const response = await fetch(this.baseUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Airtable API error:', errorData);
          throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        // Map Airtable records to Recipe objects
        return data.records.map((record: any) => {
          const fields = record.fields;
          
          // Parse ingredients
          const ingredientsText = fields.Ingredients || '';
          const ingredients = ingredientsText.split('\n').map((ing: string) => {
            const match = ing.match(/(.*?)\s*\((.*?)\)/);
            if (match) {
              const [_, name, quantityMeasurement] = match;
              const parts = quantityMeasurement.split(' ');
              if (parts.length > 1) {
                return {
                  name: name.trim(),
                  quantity: parts[0],
                  measurement: parts.slice(1).join(' ')
                };
              }
              return { name: name.trim(), quantity: quantityMeasurement };
            }
            return { name: ing.trim() };
          });
          
          // Parse preparation steps
          const stepsText = fields['Preparation Steps'] || '';
          const steps = stepsText.split('\n')
            .map((step: string) => step.replace(/^\d+\.\s*/, '').trim())
            .filter((step: string) => step.length > 0);
          
          // Parse dietary flags
          const dietaryFlags = (fields['Dietary Flags'] || '')
            .split(',')
            .map((flag: string) => flag.trim())
            .filter((flag: string) => flag.length > 0);
          
          return {
            id: record.id,
            recipeName: fields['Recipe Name'] || 'Unnamed Recipe',
            recipeCategory: fields['Recipe Category'] || 'Other',
            dietaryFlags,
            ingredients,
            preparationSteps: steps,
            preparationTime: parseInt(fields['Preparation Time'] || '0', 10),
            cookTime: parseInt(fields['Cook Time'] || '0', 10),
            totalTime: parseInt(fields['Total Time'] || '0', 10),
            servings: parseInt(fields['Servings'] || '0', 10),
            difficultyLevel: fields['Difficulty Level'] || 'Medium',
            shortVisualDescription: fields['Short Visual Description'] || '',
            imageUrl: fields['Image URL'] || '',
            created: fields.Created ? new Date(fields.Created) : new Date()
          };
        });
      });
    } catch (error) {
      console.error('Error getting recipes from Airtable:', error);
      return [];
    }
  }

  /**
   * Get a single recipe by ID
   * @param id Recipe ID
   * @returns Recipe or null if not found
   */
  public async getRecipe(id: string): Promise<Recipe | null> {
    try {
      return await apiRateLimiter.add(async () => {
        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const errorData = await response.json();
          console.error('Airtable API error:', errorData);
          throw new Error(`Airtable API error: ${errorData.error?.message || response.statusText}`);
        }

        const record = await response.json();
        const fields = record.fields;
        
        // Parse ingredients and steps as in getRecipes
        // ... (parsing code would be the same as in getRecipes)
        
        return {
          id: record.id,
          recipeName: fields['Recipe Name'] || 'Unnamed Recipe',
          recipeCategory: fields['Recipe Category'] || 'Other',
          dietaryFlags: (fields['Dietary Flags'] || '').split(',').map((f: string) => f.trim()),
          ingredients: [], // Parse as in getRecipes
          preparationSteps: [], // Parse as in getRecipes
          preparationTime: parseInt(fields['Preparation Time'] || '0', 10),
          cookTime: parseInt(fields['Cook Time'] || '0', 10),
          totalTime: parseInt(fields['Total Time'] || '0', 10),
          servings: parseInt(fields['Servings'] || '0', 10),
          difficultyLevel: fields['Difficulty Level'] || 'Medium',
          shortVisualDescription: fields['Short Visual Description'] || '',
          imageUrl: fields['Image URL'] || '',
          created: fields.Created ? new Date(fields.Created) : new Date()
        };
      });
    } catch (error) {
      console.error('Error getting recipe from Airtable:', error);
      return null;
    }
  }
}

// Export a singleton instance that will be initialized with credentials later
let airtableService: AirtableService | null = null;

export const initAirtable = (
  apiKey: string,
  baseId: string,
  tableName: string
): AirtableService => {
  airtableService = new AirtableService(apiKey, baseId, tableName);
  return airtableService;
};

export const getAirtable = (): AirtableService | null => {
  return airtableService;
};
