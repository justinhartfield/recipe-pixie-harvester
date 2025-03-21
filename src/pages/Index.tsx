
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import ProcessingQueue from '@/components/ProcessingQueue';
import { useToast } from '@/components/ui/use-toast';
import { APICredentials, ProcessingStatus, Recipe } from '@/utils/types';
import { getBunnyStorage } from '@/services/bunnyService';
import { getOpenAIVision } from '@/services/openaiService';
import { getAirtable } from '@/services/airtableService';
import { apiRateLimiter } from '@/utils/rateLimit';

const Index = () => {
  const { toast } = useToast();
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<ProcessingStatus[]>([]);
  const [apiRateLimit, setApiRateLimit] = useState(5000);

  // Check for credentials on load
  useEffect(() => {
    const bunnyStorageAccessKey = localStorage.getItem('bunnyStorageAccessKey');
    const bunnyStorageName = localStorage.getItem('bunnyStorageName');
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const airtableApiKey = localStorage.getItem('airtableApiKey');
    const airtableBaseId = localStorage.getItem('airtableBaseId');
    const airtableTableName = localStorage.getItem('airtableTableName');

    const hasCredentials = !!(
      bunnyStorageAccessKey && 
      bunnyStorageName && 
      openaiApiKey && 
      airtableApiKey && 
      airtableBaseId && 
      airtableTableName
    );

    setIsCredentialsSet(hasCredentials);
  }, []);

  const handleCredentialsUpdate = (credentials: APICredentials) => {
    setIsCredentialsSet(true);
  };

  const handleRateLimitChange = (value: number) => {
    setApiRateLimit(value);
    apiRateLimiter.setDelay(value);
  };

  const handleImagesSelected = (files: File[]) => {
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

  const processFiles = async (items: any[]) => {
    for (const item of items) {
      await processFile(item);
    }
    setIsProcessing(false);
  };

  const processFile = async (item: any) => {
    const bunnyStorage = getBunnyStorage();
    const openAIVision = getOpenAIVision();
    const airtable = getAirtable();

    if (!bunnyStorage || !openAIVision || !airtable) {
      updateQueueItem(item.id, {
        status: 'error',
        progress: 100,
        error: 'Services not properly initialized'
      });
      return;
    }

    try {
      // Step 1: Upload to Bunny.net
      updateQueueItem(item.id, { status: 'uploading', progress: 10 });
      const uploadResult = await bunnyStorage.uploadFile(item.file);
      
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onCredentialsUpdate={handleCredentialsUpdate}
        apiRateLimit={apiRateLimit}
        onRateLimitChange={handleRateLimitChange}
      />
      
      <main className="flex-1 container max-w-screen-xl mx-auto py-8 px-4 md:px-8">
        <div className="space-y-8">
          {!isCredentialsSet && (
            <div className="glass-light dark:glass-dark p-6 rounded-lg max-w-2xl mx-auto text-center animate-fade-in">
              <h2 className="text-xl font-medium mb-3">Welcome to Recipe Vision</h2>
              <p className="text-muted-foreground mb-4">
                This application processes recipe images through AI vision analysis and stores the data in Airtable.
              </p>
              <p className="mb-4">
                To begin, click the <strong>Settings</strong> button above to configure your API credentials.
              </p>
              <div className="text-sm text-muted-foreground">
                You'll need:
                <ul className="mt-2 space-y-1">
                  <li>Bunny.net Storage credentials</li>
                  <li>OpenAI API key</li>
                  <li>Airtable API key, Base ID, and Table Name</li>
                </ul>
              </div>
            </div>
          )}

          <ImageUploader 
            onImagesSelected={handleImagesSelected}
            isProcessing={isProcessing}
          />

          {processingQueue.length > 0 && (
            <ProcessingQueue 
              items={processingQueue}
              onClearCompleted={handleClearCompleted}
            />
          )}
        </div>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container max-w-screen-xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground">
          <p>Recipe Vision — Upload, analyze, and store recipe data</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
