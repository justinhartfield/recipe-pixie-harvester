
export type RecipeCategory = 'Appetizer' | 'Main Course' | 'Side Dish' | 'Dessert' | 'Beverage' | 'Snack' | 'Salad' | 'Breakfast' | 'Other';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Advanced';

export interface Ingredient {
  name: string;
  quantity?: string;
  measurement?: string;
}

export interface Recipe {
  id?: string;
  recipeName: string;
  recipeCategory: RecipeCategory;
  dietaryFlags: string[];
  ingredients: Ingredient[];
  preparationSteps: string[];
  preparationTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficultyLevel: DifficultyLevel;
  shortVisualDescription: string;
  imageUrl?: string;
  created?: Date;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface ProcessingStatus {
  id: string;
  fileName: string;
  status: 'queued' | 'uploading' | 'analyzing' | 'storing' | 'complete' | 'error';
  progress: number;
  imageUrl?: string;
  recipe?: Recipe;
  error?: string;
  created: Date;
  viewed?: boolean;
  file: File;
}

export interface APICredentials {
  openaiApiKey?: string;
  airtableApiKey?: string;
  airtableBaseId?: string;
  airtableTableName?: string;
}
