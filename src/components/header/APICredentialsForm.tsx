
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { initOpenAIVision } from '@/services/openaiService';
import { initAirtable } from '@/services/airtableService';
import { APICredentials } from '@/utils/types';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface APICredentialsFormProps {
  credentials: APICredentials;
  onCredentialChange: (key: keyof APICredentials, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const APICredentialsForm = ({
  credentials,
  onCredentialChange,
  onSave,
  onCancel
}: APICredentialsFormProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    // Validate required fields
    if (!credentials.openaiApiKey || !credentials.airtableApiKey || 
        !credentials.airtableBaseId || !credentials.airtableTableName) {
      toast({
        title: "Missing credentials",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    Object.entries(credentials).forEach(([key, value]) => {
      if (value) {
        localStorage.setItem(key, value);
      }
    });

    // Initialize services
    try {
      initOpenAIVision(credentials.openaiApiKey);
      
      initAirtable(
        credentials.airtableApiKey,
        credentials.airtableBaseId,
        credentials.airtableTableName
      );

      toast({
        title: "Settings saved",
        description: "API credentials have been saved and services initialized",
      });

      onSave();
    } catch (error) {
      console.error('Error initializing services:', error);
      toast({
        title: "Configuration error",
        description: error instanceof Error ? error.message : "Failed to initialize services",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 py-4">
      <Alert className="bg-blue-50 border-blue-200">
        <AlertTitle>Airtable Configuration Requirements</AlertTitle>
        <AlertDescription>
          <p>Your Airtable base must have the following fields:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Name</strong> (Single line text)</li>
            <li><strong>Image</strong> (Attachment type)</li> 
            <li><strong>Type</strong> (Single select)</li>
            <li><strong>Upload Date</strong> (Date)</li>
            <li><strong>Recipe Name</strong> (Single line text)</li>
            <li><strong>Recipe Category</strong> (Single select)</li>
            <li><strong>Ingredients</strong> (Long text)</li>
            <li><strong>Preparation Steps</strong> (Long text)</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <div className="grid gap-2">
        <h3 className="text-lg font-medium">OpenAI</h3>
        <div className="space-y-2">
          <Label htmlFor="openaiApiKey">API Key</Label>
          <Input
            id="openaiApiKey"
            value={credentials.openaiApiKey}
            onChange={(e) => onCredentialChange('openaiApiKey', e.target.value)}
            placeholder="Enter OpenAI API Key"
            type="password"
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <h3 className="text-lg font-medium">Airtable</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airtableApiKey">API Key</Label>
            <Input
              id="airtableApiKey"
              value={credentials.airtableApiKey}
              onChange={(e) => onCredentialChange('airtableApiKey', e.target.value)}
              placeholder="Enter Airtable API Key"
              type="password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airtableBaseId">Base ID</Label>
            <Input
              id="airtableBaseId"
              value={credentials.airtableBaseId}
              onChange={(e) => onCredentialChange('airtableBaseId', e.target.value)}
              placeholder="Enter Airtable Base ID (appXXXXXXXX)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="airtableTableName">Table Name</Label>
            <Input
              id="airtableTableName"
              value={credentials.airtableTableName}
              onChange={(e) => onCredentialChange('airtableTableName', e.target.value)}
              placeholder="Enter Airtable Table Name"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default APICredentialsForm;
