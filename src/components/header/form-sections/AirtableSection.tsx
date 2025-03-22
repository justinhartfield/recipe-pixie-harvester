
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { APICredentials } from '@/utils/types';
import { isValidBaseId } from '../validation/airtableValidation';

interface AirtableSectionProps {
  airtableApiKey: string;
  airtableBaseId: string;
  airtableTableName: string;
  onCredentialChange: (key: keyof APICredentials, value: string) => void;
}

const AirtableSection = ({ 
  airtableApiKey, 
  airtableBaseId, 
  airtableTableName, 
  onCredentialChange 
}: AirtableSectionProps) => {
  return (
    <div className="grid gap-2">
      <h3 className="text-lg font-medium">Airtable</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="airtableApiKey">API Token</Label>
          <Input
            id="airtableApiKey"
            value={airtableApiKey}
            onChange={(e) => onCredentialChange('airtableApiKey', e.target.value)}
            placeholder="Enter Airtable Personal Access Token"
            type="password"
          />
          <p className="text-xs text-muted-foreground">
            Find your token in your <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Airtable account settings</a>
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="airtableBaseId">Base ID</Label>
          <Input
            id="airtableBaseId"
            value={airtableBaseId}
            onChange={(e) => onCredentialChange('airtableBaseId', e.target.value)}
            placeholder="Enter Airtable Base ID (appXXXXXXXX)"
            className={!isValidBaseId(airtableBaseId) && airtableBaseId ? "border-red-300" : ""}
          />
          <p className="text-xs text-muted-foreground">
            Find in your base URL: airtable.com/{airtableBaseId ? airtableBaseId : 'appXXXXXXXX'}/...
          </p>
          {airtableBaseId && !isValidBaseId(airtableBaseId) && (
            <p className="text-xs text-red-500">
              Invalid format. Base ID should start with "app" followed by 14-17 alphanumeric characters.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="airtableTableName">Table Name</Label>
          <Input
            id="airtableTableName"
            value={airtableTableName}
            onChange={(e) => onCredentialChange('airtableTableName', e.target.value)}
            placeholder="Enter Airtable Table Name"
          />
          <p className="text-xs text-muted-foreground">
            The exact name of your table (case-sensitive)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AirtableSection;
