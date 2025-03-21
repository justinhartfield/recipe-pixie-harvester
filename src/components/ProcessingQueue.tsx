
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProcessingStatus } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RecipeCard from './RecipeCard';

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

  const getStatusIcon = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'queued':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
            <line x1="9" x2="15" y1="12" y2="12"></line>
          </svg>
        );
      case 'uploading':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 animate-pulse">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" x2="12" y1="3" y2="15"></line>
          </svg>
        );
      case 'analyzing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 animate-pulse">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
          </svg>
        );
      case 'storing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 animate-pulse">
            <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path>
          </svg>
        );
      case 'complete':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" x2="9" y1="9" y2="15"></line>
            <line x1="9" x2="15" y1="9" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="16"></line>
            <line x1="8" x2="16" y1="12" y2="12"></line>
          </svg>
        );
    }
  };

  const getStatusText = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'queued': return 'Queued';
      case 'uploading': return 'Uploading';
      case 'analyzing': return 'Analyzing';
      case 'storing': return 'Storing';
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  const getProgressColor = (status: ProcessingStatus['status']) => {
    switch (status) {
      case 'queued': return 'bg-muted-foreground';
      case 'uploading': return 'bg-blue-500';
      case 'analyzing': return 'bg-amber-500';
      case 'storing': return 'bg-indigo-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-destructive';
      default: return 'bg-muted-foreground';
    }
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
      <div
        key={item.id}
        className={`p-3 border-b border-border last:border-0 flex items-center gap-3 cursor-pointer transition-colors hover:bg-accent/50 ${
          item.status === 'error' ? 'bg-destructive/5' : ''
        }`}
        onClick={() => handleItemClick(item)}
      >
        <div className="w-10 h-10 rounded-md bg-muted/50 overflow-hidden flex items-center justify-center shrink-0">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.fileName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium truncate text-sm">
              {item.fileName}
            </span>
            <span className="flex items-center text-xs gap-1 ml-2 shrink-0">
              {getStatusIcon(item.status)}
              {getStatusText(item.status)}
            </span>
          </div>
          
          <div className="mt-1">
            <Progress 
              value={item.progress} 
              className="h-1.5"
              indicatorClassName={getProgressColor(item.status)}
            />
          </div>
          
          {item.error && (
            <p className="text-xs text-destructive mt-1 truncate">
              {item.error}
            </p>
          )}
        </div>
      </div>
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

      {/* Recipe Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
    </div>
  );
};

export default ProcessingQueue;
