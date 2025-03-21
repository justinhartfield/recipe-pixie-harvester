
import { Recipe, ImageUploadResult } from '@/utils/types';
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
    
    // Log for debugging
    console.log(`Initialized Airtable service with base URL: ${this.baseUrl}`);
  }

  /**
   * Validate Airtable configuration by making a test request
   * @returns True if configuration is valid
   */
  public async validateConfig(): Promise<{ valid: boolean; error?: string }> {
    try {
      console.log('Validating Airtable configuration...');
      console.log(`Base URL: ${this.baseUrl}`);
      console.log(`API Key (masked): ${this.apiKey.substring(0, 5)}...${this.apiKey.substring(this.apiKey.length - 4)}`);
      console.log(`Base ID: ${this.baseId}`);
      console.log(`Table Name: ${this.tableName}`);
      
      // First, validate the base ID structure
      if (!this.baseId.startsWith('app')) {
        return { 
          valid: false, 
          error: 'Invalid Base ID format. It should start with "app" followed by alphanumeric characters.' 
        };
      }

      // Validate the Airtable API connection by first checking the base
      const baseResponse = await fetch(`https://api.airtable.com/v0/${this.baseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      // Log full response for debugging
      console.log(`Base validation response status: ${baseResponse.status}`);
      console.log(`Base validation response status text: ${baseResponse.statusText}`);
      
      if (!baseResponse.ok) {
        // Log response headers for debugging
        const headers: Record<string, string> = {};
        baseResponse.headers.forEach((value, key) => {
          headers[key] = value;
        });
        console.log('Response headers:', headers);
        
        let errorText = '';
        try {
          const errorData = await baseResponse.json();
          console.error('Airtable base validation error:', errorData);
          errorText = errorData.error?.message || '';
        } catch (e) {
          errorText = await baseResponse.text();
          console.error('Non-JSON error response:', errorText);
        }

        if (baseResponse.status === 404) {
          return { 
            valid: false, 
            error: `Base not found: '${this.baseId}'. Please check your Base ID in the Airtable workspace URL.` 
          };
        } else if (baseResponse.status === 401) {
          return { 
            valid: false, 
            error: 'Authentication failed. Your API token may be invalid or expired.'
          };
        } else if (baseResponse.status === 403) {
          return { 
            valid: false, 
            error: 'Access forbidden. Make sure your API token has access to this base and has the correct permissions.'
          };
        } else {
          return { 
            valid: false, 
            error: `Airtable API error: ${errorText || baseResponse.statusText}`
          };
        }
      }

      // If base is valid, now check the table
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      // Log table validation response
      console.log(`Table validation response status: ${response.status}`);
      console.log(`Table validation response status text: ${response.statusText}`);

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          console.error('Airtable table validation error:', errorData);
          errorText = errorData.error?.message || '';
        } catch (e) {
          errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
        }
        
        if (response.status === 404) {
          return { 
            valid: false, 
            error: `Table not found: '${this.tableName}' in base '${this.baseId}'. Make sure the table name is correct and case-sensitive.` 
          };
        }
        
        return { 
          valid: false, 
          error: `Airtable API error: ${errorText || response.statusText}`
        };
      }

      // Check if the required fields exist in the table
      try {
        const tableData = await response.json();
        console.log('Table validation successful. Records returned:', tableData.records?.length);
        
        if (!tableData.records) {
          return { valid: true }; // No records but schema is valid
        }
        
        // Get a sample record to check fields (if there are records)
        if (tableData.records.length > 0) {
          const sampleRecord = tableData.records[0];
          console.log('Sample record fields:', Object.keys(sampleRecord.fields));
        }
        
        return { valid: true };
      } catch (error) {
        console.error('Error parsing table validation response:', error);
        return { 
          valid: false, 
          error: 'Failed to parse Airtable response. The API response format may have changed.'
        };
      }
    } catch (error) {
      console.error('Airtable validation error:', error);
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error validating Airtable configuration'
      };
    }
  }

  /**
   * Upload image to Airtable as an attachment
   * @param file The image file to upload
   * @returns Upload result with URL if successful
   */
  public async uploadImage(file: File): Promise<ImageUploadResult> {
    try {
      // First validate the configuration
      const configValidation = await this.validateConfig();
      if (!configValidation.valid) {
        return {
          success: false,
          error: configValidation.error || 'Invalid Airtable configuration'
        };
      }
      
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      if (!base64) {
        return {
          success: false,
          error: 'Failed to convert image to base64'
        };
      }
      
      console.log(`Converted ${file.name} to base64 (length: ${base64.length})`);
      console.log(`Uploading to Airtable URL: ${this.baseUrl}`);
      
      // Create a record with the image attachment
      const record = {
        fields: {
          "Name": file.name,
          "Image": [
            {
              filename: file.name,
              content: base64,
              type: file.type
            }
          ],
          "Type": "Image",
          "Upload Date": new Date().toISOString()
        }
      };

      return await apiRateLimiter.add(async () => {
        console.log(`Uploading image to Airtable: ${file.name}`);
        
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(record),
        });

        if (!response.ok) {
          let errorMessage = response.statusText;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || response.statusText;
            console.error('Airtable API error details:', errorData);
          } catch (e) {
            // Response might not be JSON
            console.error('Non-JSON error response:', await response.text());
          }
          
          if (response.status === 404) {
            errorMessage = `Table not found: '${this.tableName}' in base '${this.baseId}'. Please check your Airtable configuration.`;
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = 'Authentication failed. Please check your Airtable API key.';
          }
          
          console.error(`Airtable upload failed (${response.status}): ${errorMessage}`);
          
          return {
            success: false,
            error: `Upload failed: ${errorMessage}`
          };
        }

        const data = await response.json();
        console.log('Airtable upload response:', data);
        
        // Get the URL of the uploaded image from the attachment field
        const attachmentUrl = data.fields?.Image?.[0]?.url || data.fields?.Image?.[0]?.thumbnails?.large?.url;
        
        if (!attachmentUrl) {
          console.error('Image uploaded but URL not returned:', data);
          return {
            success: false,
            error: 'Image uploaded but URL not returned'
          };
        }

        console.log('Airtable image upload successful:', attachmentUrl);
        
        return {
          success: true,
          url: attachmentUrl
        };
      });
    } catch (error) {
      console.error('Airtable image upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  }

  /**
   * Convert file to base64
   * @param file The file to convert
   * @returns Base64 string
   */
  private fileToBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => {
        console.error('Error converting file to base64:', error);
        reject(null);
      };
    });
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
