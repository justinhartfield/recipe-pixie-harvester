
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import APICredentialsForm from './APICredentialsForm';
import RateLimitSetting from './RateLimitSetting';
import { APICredentials } from '@/utils/types';

interface SettingsDialogProps {
  credentials: APICredentials;
  onCredentialsUpdate: (credentials: APICredentials) => void;
  apiRateLimit: number;
  onRateLimitChange: (value: number) => void;
}

const SettingsDialog = ({
  credentials,
  onCredentialsUpdate,
  apiRateLimit,
  onRateLimitChange
}: SettingsDialogProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localCredentials, setLocalCredentials] = useState<APICredentials>(credentials);

  // Reset local state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalCredentials(credentials);
    }
    setIsSettingsOpen(open);
  };

  const handleCredentialChange = (key: keyof APICredentials, value: string) => {
    setLocalCredentials(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onCredentialsUpdate(localCredentials);
    setIsSettingsOpen(false);
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={handleOpenChange}>
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
        
        <APICredentialsForm 
          credentials={localCredentials}
          onCredentialChange={handleCredentialChange}
          onSave={handleSave}
          onCancel={() => setIsSettingsOpen(false)}
        />
        
        <RateLimitSetting 
          apiRateLimit={apiRateLimit}
          onRateLimitChange={onRateLimitChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
