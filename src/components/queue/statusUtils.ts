
import { ProcessingStatus } from '@/utils/types';

export const getStatusText = (status: ProcessingStatus['status']) => {
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

export const getProgressColor = (status: ProcessingStatus['status']) => {
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
