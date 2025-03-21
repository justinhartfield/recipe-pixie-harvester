
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProcessingStatus } from '@/utils/types';
import QueueItem from './queue/QueueItem';
import RecipeDetailDialog from './queue/RecipeDetailDialog';

interface ProcessingQueueProps {
  items: ProcessingStatus[];
  onClearCompleted: () => void;
}

const ProcessingQueue = ({ items, onClearCompleted }: ProcessingQueueProps) => {
  const [selectedItem, setSelectedItem] = useState<ProcessingStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Auto-open dialog when a recipe analysis is complete
    const lastCompleted = items.find(item => 
      item.status === 'complete' && item.recipe && !item.viewed
    );
    if (lastCompleted) {
      setSelectedItem(lastCompleted);
      setIsDialogOpen(true);
    }
  }, [items]);

  const handleItemClick = (item: ProcessingStatus) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const renderQueueItems = () => {
    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No items in the processing queue
        </div>
      );
    }

    return items.map((item) => (
      <QueueItem 
        key={item.id} 
        item={item} 
        onClick={handleItemClick} 
      />
    ));
  };

  const hasCompletedItems = items.some(item => 
    item.status === 'complete' || item.status === 'error'
  );

  return (
    <div className="w-full animate-slide-up">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Processing Queue</CardTitle>
            {hasCompletedItems && (
              <button
                onClick={onClearCompleted}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear Completed
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            {renderQueueItems()}
          </ScrollArea>
        </CardContent>
      </Card>

      <RecipeDetailDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedItem={selectedItem}
      />
    </div>
  );
};

export default ProcessingQueue;
