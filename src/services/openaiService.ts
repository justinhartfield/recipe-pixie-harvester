
import { Recipe } from '@/utils/types';
import { apiRateLimiter } from '@/utils/rateLimit';

export class OpenAIVisionService {
  private apiKey: string;
  private model: string;
  private prompt: string;

  /**
   * Create a new OpenAIVisionService
   * @param apiKey OpenAI API Key
   * @param model Model to use (default: gpt-4o)
   */
  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.apiKey = apiKey;
    this.model = model;
    this.prompt = `You are an expert culinary AI specializing in gluten-free, soy-free, and dairy-free recipes.  
Examine the attached image of the final plated dish. Based solely on what you see, accurately infer and generate structured recipe metadata with these fields:

Recipe Name:  
Recipe Category: [Appetizer, Main Course, Side Dish, Dessert, Beverage, Snack, Salad, Breakfast, Other]  
Dietary Flags: Gluten-Free, Dairy-Free, Soy-Free  

Ingredients List:  
- Ingredient 1 (quantity, measurement)  
- Ingredient 2 (quantity, measurement)  
- ...  

Preparation Steps:  
1. Step-by-step instructions.  
2. Continue numbered steps as needed.

Preparation Time: [minutes]  
Cook Time: [minutes]  
Total Time: [minutes]  
Servings: [number]  
Difficulty Level: [Easy, Medium, Advanced]

Short Visual Description: [Brief appearance description]

Provide ONLY this structured format with no extra commentary.`;
  }

  /**
   * Analyze an image using OpenAI Vision API
   * @param imageUrl URL of the image to analyze
   * @returns Parsed recipe data
   */
  public async analyzeImage(imageUrl: string): Promise<Recipe | null> {
    try {
      return await apiRateLimiter.add(async () => {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: this.prompt },
                  { type: 'image_url', image_url: { url: imageUrl } }
                ]
              }
            ],
            max_tokens: 2000
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('OpenAI API error:', errorData);
          throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const recipeText = data.choices[0].message.content;
        
        // Parse the structured text into a Recipe object
        return this.parseRecipeText(recipeText);
      });
    } catch (error) {
      console.error('Error analyzing image with OpenAI:', error);
      return null;
    }
  }

  /**
   * Set a custom prompt for the OpenAI Vision API
   * @param prompt Custom prompt text
   */
  public setPrompt(prompt: string): void {
    this.prompt = prompt;
  }

  /**
   * Parse the structured text from OpenAI into a Recipe object
   * @param text Structured recipe text
   * @returns Parsed Recipe object
   */
  private parseRecipeText(text: string): Recipe {
    // Basic extraction using regex patterns
    const recipeName = this.extractValue(text, 'Recipe Name:', '\\s*Recipe Category:') || 'Unnamed Recipe';
    const recipeCategory = this.extractValue(text, 'Recipe Category:', '\\s*Dietary Flags:') || 'Other';
    const dietaryFlagsText = this.extractValue(text, 'Dietary Flags:', '\\s*Ingredients List:') || '';
    const dietaryFlags = dietaryFlagsText.split(',').map(flag => flag.trim());
    
    // Extract ingredients
    const ingredientsListText = this.extractValue(text, 'Ingredients List:', '\\s*Preparation Steps:') || '';
    const ingredientLines = ingredientsListText.split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-'));
    
    const ingredients = ingredientLines.map(line => {
      // Remove the leading dash and trim
      const ingredientText = line.substring(1).trim();
      // Try to extract quantity and measurement from parentheses
      const match = ingredientText.match(/(.*?)\s*\((.*?)\)/);
      if (match) {
        const [_, name, quantityMeasurement] = match;
        // Try to split quantity and measurement
        const qmParts = quantityMeasurement.split(',');
        if (qmParts.length > 1) {
          return {
            name: name.trim(),
            quantity: qmParts[0].trim(),
            measurement: qmParts[1].trim()
          };
        } else {
          // Try to split by space
          const qmSpace = quantityMeasurement.trim().split(' ');
          if (qmSpace.length > 1) {
            return {
              name: name.trim(),
              quantity: qmSpace[0].trim(),
              measurement: qmSpace.slice(1).join(' ').trim()
            };
          } else {
            return {
              name: name.trim(),
              quantity: quantityMeasurement.trim()
            };
          }
        }
      }
      return { name: ingredientText };
    });
    
    // Extract preparation steps
    const preparationStepsText = this.extractValue(text, 'Preparation Steps:', '\\s*Preparation Time:') || '';
    const preparationSteps = preparationStepsText.split('\n')
      .map(line => line.trim())
      .filter(line => /^\d+\./.test(line))
      .map(step => step.replace(/^\d+\.\s*/, ''));
    
    // Extract other fields
    const preparationTime = parseInt(this.extractValue(text, 'Preparation Time:', '\\s*Cook Time:') || '0', 10);
    const cookTime = parseInt(this.extractValue(text, 'Cook Time:', '\\s*Total Time:') || '0', 10);
    const totalTime = parseInt(this.extractValue(text, 'Total Time:', '\\s*Servings:') || '0', 10);
    const servings = parseInt(this.extractValue(text, 'Servings:', '\\s*Difficulty Level:') || '0', 10);
    const difficultyLevel = this.extractValue(text, 'Difficulty Level:', '\\s*Short Visual Description:') || 'Medium';
    const shortVisualDescription = this.extractValue(text, 'Short Visual Description:', '$') || '';
    
    return {
      recipeName,
      recipeCategory: recipeCategory as any,
      dietaryFlags,
      ingredients,
      preparationSteps,
      preparationTime,
      cookTime,
      totalTime,
      servings,
      difficultyLevel: difficultyLevel as any,
      shortVisualDescription,
      created: new Date()
    };
  }
  
  /**
   * Extract a value from text using regex
   * @param text Source text
   * @param startPattern Start pattern
   * @param endPattern End pattern
   * @returns Extracted value or null
   */
  private extractValue(text: string, startPattern: string, endPattern: string): string | null {
    const escapedStart = startPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedStart}\\s*(.*?)(?=${endPattern})`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }
}

// Export a singleton instance that will be initialized with credentials later
let openAIVisionService: OpenAIVisionService | null = null;

export const initOpenAIVision = (
  apiKey: string,
  model: string = 'gpt-4o'
): OpenAIVisionService => {
  openAIVisionService = new OpenAIVisionService(apiKey, model);
  return openAIVisionService;
};

export const getOpenAIVision = (): OpenAIVisionService | null => {
  return openAIVisionService;
};
