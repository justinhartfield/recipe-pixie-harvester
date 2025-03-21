
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { initBunnyStorage } from '@/services/bunnyService';
import { initOpenAIVision } from '@/services/openaiService';
import { initAirtable } from '@/services/airtableService';
import { APICredentials } from '@/utils/types';

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
    if (!credentials.bunnyStorageAccessKey || !credentials.bunnyStorageName || 
        !credentials.openaiApiKey || !credentials.airtableApiKey || 
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
      initBunnyStorage(
        credentials.bunnyStorageAccessKey,
        credentials.bunnyStorageName,
        credentials.bunnyStorageRegion,
        credentials.bunnyPullZoneId
      );
      
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
      <div className="grid gap-2">
        <h3 className="text-lg font-medium">Bunny.net Storage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bunnyStorageAccessKey">Access Key</Label>
            <Input
              id="bunnyStorageAccessKey"
              value={credentials.bunnyStorageAccessKey}
              onChange={(e) => onCredentialChange('bunnyStorageAccessKey', e.target.value)}
              placeholder="Enter Bunny.net Storage Access Key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bunnyStorageName">Storage Name</Label>
            <Input
              id="bunnyStorageName"
              value={credentials.bunnyStorageName}
              onChange={(e) => onCredentialChange('bunnyStorageName', e.target.value)}
              placeholder="Enter Bunny.net Storage Zone Name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bunnyStorageRegion">Region</Label>
            <Input
              id="bunnyStorageRegion"
              value={credentials.bunnyStorageRegion}
              onChange={(e) => onCredentialChange('bunnyStorageRegion', e.target.value)}
              placeholder="Storage Region (e.g., de, ny, la)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bunnyPullZoneId">Pull Zone ID (optional)</Label>
            <Input
              id="bunnyPullZoneId"
              value={credentials.bunnyPullZoneId}
              onChange={(e) => onCredentialChange('bunnyPullZoneId', e.target.value)}
              placeholder="Enter Bunny.net Pull Zone ID"
            />
          </div>
        </div>
      </div>
      
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
              placeholder="Enter Airtable Base ID"
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
