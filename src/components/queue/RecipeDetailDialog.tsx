
import React from 'react';
import { ProcessingStatus } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RecipeCard from '../RecipeCard';

interface RecipeDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: ProcessingStatus | null;
}

const RecipeDetailDialog = ({ isOpen, onOpenChange, selectedItem }: RecipeDetailDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Recipe Details</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {selectedItem?.recipe ? (
            <RecipeCard recipe={selectedItem.recipe} imageUrl={selectedItem.imageUrl} />
          ) : selectedItem?.error ? (
            <div className="p-4 bg-destructive/10 rounded-md text-destructive">
              <h3 className="font-medium mb-2">Error Processing Image</h3>
              <p>{selectedItem.error}</p>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-muted-foreground">
                {selectedItem?.status === 'analyzing' ? 'Analyzing image...' : 'No data available'}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailDialog;
