
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Recipe } from "@/utils/types";
import RecipeCard from "./RecipeCard";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  imageUrl?: string;
}

const RecipeModal = ({ isOpen, onClose, recipe, imageUrl }: RecipeModalProps) => {
  if (!recipe) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{recipe.recipeName}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto py-4">
          <RecipeCard recipe={recipe} imageUrl={imageUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeModal;
