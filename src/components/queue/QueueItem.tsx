
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ProcessingStatus } from '@/utils/types';
import StatusIcon from './StatusIcon';
import { getProgressColor, getStatusText } from './statusUtils';

interface QueueItemProps {
  item: ProcessingStatus;
  onClick: (item: ProcessingStatus) => void;
}

const QueueItem = ({ item, onClick }: QueueItemProps) => {
  return (
    <div
      className={`p-3 border-b border-border last:border-0 flex items-center gap-3 cursor-pointer transition-colors hover:bg-accent/50 ${
        item.status === 'error' ? 'bg-destructive/5' : ''
      }`}
      onClick={() => onClick(item)}
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
            <StatusIcon status={item.status} />
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
  );
};

export default QueueItem;
