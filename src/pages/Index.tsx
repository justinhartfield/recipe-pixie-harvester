
import React from 'react';
import Header from '@/components/Header';
import ImageUploader from '@/components/ImageUploader';
import ProcessingQueue from '@/components/ProcessingQueue';
import WelcomeMessage from '@/components/WelcomeMessage';
import { useCredentials } from '@/hooks/useCredentials';
import { useImageProcessing } from '@/hooks/useImageProcessing';

const Index = () => {
  const { isCredentialsSet, handleCredentialsUpdate } = useCredentials();
  const {
    isProcessing,
    processingQueue,
    apiRateLimit,
    handleRateLimitChange,
    handleImagesSelected,
    handleClearCompleted
  } = useImageProcessing();

  const handleImageSelection = (files: File[]) => {
    handleImagesSelected(files, isCredentialsSet);
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
          {!isCredentialsSet && <WelcomeMessage />}

          <ImageUploader 
            onImagesSelected={handleImageSelection}
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
