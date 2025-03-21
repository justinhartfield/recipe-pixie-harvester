
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';
import { initBunnyStorage } from '@/services/bunnyService';
import { initOpenAIVision } from '@/services/openaiService';
import { initAirtable } from '@/services/airtableService';
import { APICredentials } from '@/utils/types';

interface HeaderProps {
  onCredentialsUpdate: (credentials: APICredentials) => void;
  apiRateLimit: number;
  onRateLimitChange: (value: number) => void;
}

const Header = ({
  onCredentialsUpdate,
  apiRateLimit,
  onRateLimitChange,
}: HeaderProps) => {
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [credentials, setCredentials] = useState<APICredentials>({
    bunnyStorageAccessKey: localStorage.getItem('bunnyStorageAccessKey') || '',
    bunnyStorageName: localStorage.getItem('bunnyStorageName') || '',
    bunnyStorageRegion: localStorage.getItem('bunnyStorageRegion') || 'de',
    openaiApiKey: localStorage.getItem('openaiApiKey') || '',
    airtableApiKey: localStorage.getItem('airtableApiKey') || '',
    airtableBaseId: localStorage.getItem('airtableBaseId') || '',
    airtableTableName: localStorage.getItem('airtableTableName') || '',
  });

  const handleCredentialChange = (key: keyof APICredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [key]: value }));
  };

  const saveCredentials = () => {
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
        credentials.bunnyStorageRegion
      );
      
      initOpenAIVision(credentials.openaiApiKey);
      
      initAirtable(
        credentials.airtableApiKey,
        credentials.airtableBaseId,
        credentials.airtableTableName
      );

      // Notify parent component
      onCredentialsUpdate(credentials);

      toast({
        title: "Settings saved",
        description: "API credentials have been saved and services initialized",
      });

      setIsSettingsOpen(false);
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
    <header className="w-full py-6 px-8 border-b border-border animate-fade-in">
      <div className="container max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"></path>
              <circle cx="12" cy="13" r="3"></circle>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Recipe Vision</h1>
            <p className="text-sm text-muted-foreground">Bulk recipe extraction from images</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>API Configuration</DialogTitle>
                <DialogDescription>
                  Configure API credentials for Bunny.net, OpenAI, and Airtable.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <h3 className="text-lg font-medium">Bunny.net Storage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bunnyStorageAccessKey">Access Key</Label>
                      <Input
                        id="bunnyStorageAccessKey"
                        value={credentials.bunnyStorageAccessKey}
                        onChange={(e) => handleCredentialChange('bunnyStorageAccessKey', e.target.value)}
                        placeholder="Enter Bunny.net Storage Access Key"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bunnyStorageName">Storage Name</Label>
                      <Input
                        id="bunnyStorageName"
                        value={credentials.bunnyStorageName}
                        onChange={(e) => handleCredentialChange('bunnyStorageName', e.target.value)}
                        placeholder="Enter Bunny.net Storage Zone Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bunnyStorageRegion">Region</Label>
                      <Input
                        id="bunnyStorageRegion"
                        value={credentials.bunnyStorageRegion}
                        onChange={(e) => handleCredentialChange('bunnyStorageRegion', e.target.value)}
                        placeholder="Storage Region (e.g., de, ny, la)"
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
                      onChange={(e) => handleCredentialChange('openaiApiKey', e.target.value)}
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
                        onChange={(e) => handleCredentialChange('airtableApiKey', e.target.value)}
                        placeholder="Enter Airtable API Key"
                        type="password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airtableBaseId">Base ID</Label>
                      <Input
                        id="airtableBaseId"
                        value={credentials.airtableBaseId}
                        onChange={(e) => handleCredentialChange('airtableBaseId', e.target.value)}
                        placeholder="Enter Airtable Base ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airtableTableName">Table Name</Label>
                      <Input
                        id="airtableTableName"
                        value={credentials.airtableTableName}
                        onChange={(e) => handleCredentialChange('airtableTableName', e.target.value)}
                        placeholder="Enter Airtable Table Name"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <h3 className="text-lg font-medium">Rate Limiting</h3>
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Request Delay (seconds)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      min="1"
                      max="60"
                      value={apiRateLimit / 1000}
                      onChange={(e) => onRateLimitChange(parseInt(e.target.value, 10) * 1000)}
                      placeholder="Enter delay in seconds"
                    />
                    <p className="text-sm text-muted-foreground">Minimum delay between API requests.</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCredentials}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
