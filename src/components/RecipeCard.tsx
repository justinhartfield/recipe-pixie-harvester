
import { Recipe } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  imageUrl?: string;
}

const RecipeCard = ({ recipe, imageUrl }: RecipeCardProps) => {
  const [showJson, setShowJson] = useState(false);

  const handleCopyJson = () => {
    const json = JSON.stringify(recipe, null, 2);
    navigator.clipboard.writeText(json);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Recipe Image */}
      {imageUrl && (
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden border border-border aspect-square">
            <img
              src={imageUrl}
              alt={recipe.recipeName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Recipe Details */}
      <div className={`${imageUrl ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
        <div className="space-y-6">
          {/* Recipe Header */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{recipe.recipeName}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{recipe.recipeCategory}</Badge>
              {recipe.dietaryFlags.map((flag, index) => (
                <Badge key={index} variant="secondary">{flag}</Badge>
              ))}
              <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                {recipe.difficultyLevel}
              </Badge>
            </div>
          </div>

          {/* Recipe Info */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-accent/50 rounded-md p-2">
              <div className="text-sm text-muted-foreground">Prep Time</div>
              <div className="font-medium">{recipe.preparationTime} min</div>
            </div>
            <div className="bg-accent/50 rounded-md p-2">
              <div className="text-sm text-muted-foreground">Cook Time</div>
              <div className="font-medium">{recipe.cookTime} min</div>
            </div>
            <div className="bg-accent/50 rounded-md p-2">
              <div className="text-sm text-muted-foreground">Servings</div>
              <div className="font-medium">{recipe.servings}</div>
            </div>
          </div>

          {/* Description */}
          {recipe.shortVisualDescription && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p>{recipe.shortVisualDescription}</p>
            </div>
          )}

          {/* Ingredients and Steps tabs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ingredients */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base">Ingredients</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <ScrollArea className="h-[200px] pr-4">
                  <ul className="space-y-2">
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">•</span>
                        <span>
                          <span className="font-medium">{ingredient.name}</span>
                          {ingredient.quantity && (
                            <span className="text-muted-foreground">
                              {" "}
                              ({ingredient.quantity}
                              {ingredient.measurement && ` ${ingredient.measurement}`})
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Preparation Steps */}
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-base">Preparation Steps</CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <ScrollArea className="h-[200px] pr-4">
                  <ol className="space-y-2 list-decimal list-inside">
                    {recipe.preparationSteps.map((step, index) => (
                      <li key={index} className="pl-1">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* JSON Data Toggle */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowJson(!showJson)}
            >
              {showJson ? "Hide JSON" : "Show JSON"}
            </Button>
            {showJson && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
              >
                Copy JSON
              </Button>
            )}
          </div>

          {/* JSON Data */}
          {showJson && (
            <Card>
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {JSON.stringify(recipe, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
