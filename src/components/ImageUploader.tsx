
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const ImageUploader = ({ onImagesSelected, isProcessing }: ImageUploaderProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndProcessFiles(Array.from(files));
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      validateAndProcessFiles(Array.from(event.dataTransfer.files));
    }
  };

  const validateAndProcessFiles = (files: File[]) => {
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpe?g|png|gif|bmp|webp|heic|heif)$/i.test(file.name)
    );
    
    if (imageFiles.length === 0) {
      toast({
        title: "No valid images found",
        description: "Please select image files only.",
        variant: "destructive",
      });
      return;
    }
    
    if (files.length !== imageFiles.length) {
      toast({
        title: "Some files skipped",
        description: `Only ${imageFiles.length} out of ${files.length} files were valid images.`,
        variant: "default",
      });
    }
    
    // Pass the valid image files to the parent component
    onImagesSelected(imageFiles);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <Card className={`border-2 border-dashed transition-all duration-200 ${
        isDragging 
          ? 'border-primary bg-primary/5' 
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      }`}>
        <CardContent className="p-8">
          <div
            className="flex flex-col items-center justify-center gap-4 py-8"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-fade-in">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-primary"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"></path>
                <circle cx="12" cy="13" r="3"></circle>
              </svg>
            </div>
            
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-medium">Upload Recipe Images</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Drag and drop image files, or click to browse
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              variant="outline" 
              onClick={handleBrowseClick}
              disabled={isProcessing}
              className="mt-2"
            >
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageUploader;
