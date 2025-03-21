
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ProcessingStatus, Recipe } from '@/utils/types';
import { useToast } from '@/components/ui/use-toast';
import { getOpenAIVision } from '@/services/openaiService';
import { getAirtable } from '@/services/airtableService';
import { apiRateLimiter } from '@/utils/rateLimit';

export const useImageProcessing = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingStatus[]>([]);
  const [apiRateLimit, setApiRateLimit] = useState(5000);

  const handleRateLimitChange = (value: number) => {
    setApiRateLimit(value);
    apiRateLimiter.setDelay(value);
  };

  const handleImagesSelected = (files: File[], isCredentialsSet: boolean) => {
    if (!isCredentialsSet) {
      toast({
        title: "Missing configuration",
        description: "Please configure API credentials in settings before uploading images.",
        variant: "destructive",
      });
      return;
    }

    // Create queue items for each file
    const newQueueItems = files.map(file => ({
      id: uuidv4(),
      fileName: file.name,
      status: 'queued' as const,
      progress: 0,
      created: new Date(),
      file
    }));

    setProcessingQueue(prev => [...prev, ...newQueueItems]);
    setIsProcessing(true);

    // Process each file in sequence
    processFiles(newQueueItems);
  };

  const processFiles = async (items: ProcessingStatus[]) => {
    for (const item of items) {
      await processFile(item);
    }
    setIsProcessing(false);
  };

  const processFile = async (item: ProcessingStatus) => {
    const openAIVision = getOpenAIVision();
    const airtable = getAirtable();

    if (!openAIVision || !airtable) {
      updateQueueItem(item.id, {
        status: 'error',
        progress: 100,
        error: 'Services not properly initialized'
      });
      return;
    }

    try {
      // Step 1: Upload to Airtable
      updateQueueItem(item.id, { status: 'uploading', progress: 10 });
      const uploadResult = await airtable.uploadImage(item.file);
      
      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }
      
      updateQueueItem(item.id, { 
        status: 'uploading', 
        progress: 40, 
        imageUrl: uploadResult.url 
      });

      // Step 2: Analyze with OpenAI Vision
      updateQueueItem(item.id, { status: 'analyzing', progress: 50 });
      const recipe = await openAIVision.analyzeImage(uploadResult.url);
      
      if (!recipe) {
        throw new Error('Failed to analyze image with OpenAI');
      }
      
      // Add image URL to recipe
      const recipeWithImage: Recipe = {
        ...recipe,
        imageUrl: uploadResult.url
      };
      
      updateQueueItem(item.id, { 
        status: 'analyzing', 
        progress: 70, 
        recipe: recipeWithImage 
      });

      // Step 3: Store in Airtable
      updateQueueItem(item.id, { status: 'storing', progress: 80 });
      const storedRecipe = await airtable.storeRecipe(recipeWithImage);
      
      updateQueueItem(item.id, { 
        status: 'complete', 
        progress: 100, 
        recipe: storedRecipe 
      });

      toast({
        title: "Recipe processed",
        description: `Successfully processed ${item.fileName}`,
      });
    } catch (error) {
      console.error(`Error processing ${item.fileName}:`, error);
      updateQueueItem(item.id, {
        status: 'error',
        progress: 100,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      toast({
        title: "Processing failed",
        description: `Failed to process ${item.fileName}`,
        variant: "destructive",
      });
    }
  };

  const updateQueueItem = (id: string, updates: Partial<ProcessingStatus>) => {
    setProcessingQueue(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  const handleClearCompleted = () => {
    setProcessingQueue(prev => 
      prev.filter(item => 
        item.status !== 'complete' && item.status !== 'error'
      )
    );
  };

  return {
    isProcessing,
    processingQueue,
    apiRateLimit,
    handleRateLimitChange,
    handleImagesSelected,
    handleClearCompleted
  };
};
