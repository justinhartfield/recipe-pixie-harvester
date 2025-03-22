
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APICredentials } from '@/utils/types';

interface OpenAISectionProps {
  openaiApiKey: string;
  onCredentialChange: (key: keyof APICredentials, value: string) => void;
}

const OpenAISection = ({ openaiApiKey, onCredentialChange }: OpenAISectionProps) => {
  return (
    <div className="grid gap-2">
      <h3 className="text-lg font-medium">OpenAI</h3>
      <div className="space-y-2">
        <Label htmlFor="openaiApiKey">API Key</Label>
        <Input
          id="openaiApiKey"
          value={openaiApiKey}
          onChange={(e) => onCredentialChange('openaiApiKey', e.target.value)}
          placeholder="Enter OpenAI API Key"
          type="password"
        />
      </div>
    </div>
  );
};

export default OpenAISection;
