
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { initOpenAIVision } from '@/services/openaiService';
import { initAirtable, getAirtable } from '@/services/airtableService';
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
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate Base ID format (should be appXXXXXXXXXXXXXX)
  const isValidBaseId = (baseId: string) => {
    return /^app[a-zA-Z0-9]{14,17}$/.test(baseId);
  };

  const handleSave = async () => {
    // Reset validation state
    setValidationError(null);

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

    // Validate Airtable Base ID format
    if (!isValidBaseId(credentials.airtableBaseId)) {
      setValidationError(
        "Invalid Airtable Base ID format. It should start with 'app' followed by 14-17 alphanumeric characters."
      );
      toast({
        title: "Invalid Base ID format",
        description: "Base ID should be in the format: appXXXXXXXXXXXXXX",
        variant: "destructive",
      });
      return;
    }

    // Initialize services to validate configuration
    try {
      setIsValidating(true);
      
      // Initialize OpenAI (this doesn't make an API call)
      initOpenAIVision(credentials.openaiApiKey);
      
      // Initialize Airtable and validate connection
      const airtableService = initAirtable(
        credentials.airtableApiKey,
        credentials.airtableBaseId,
        credentials.airtableTableName
      );
      
      // Test the Airtable connection
      const airtableValidation = await airtableService.validateConfig();
      if (!airtableValidation.valid) {
        setValidationError(airtableValidation.error || "Failed to validate Airtable configuration");
        toast({
          title: "Airtable configuration error",
          description: airtableValidation.error || "Failed to validate Airtable configuration",
          variant: "destructive",
        });
        setIsValidating(false);
        return;
      }

      // Save to localStorage if everything is valid
      Object.entries(credentials).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        }
      });

      toast({
        title: "Settings saved",
        description: "API credentials have been saved and verified successfully",
      });

      setIsValidating(false);
      onSave();
    } catch (error) {
      console.error('Error initializing services:', error);
      setIsValidating(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize services";
      setValidationError(errorMessage);
      toast({
        title: "Configuration error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 py-4">
      {validationError && (
        <Alert variant="destructive">
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
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
          <p className="mt-2 text-sm font-medium">Make sure your Base ID is in the format <code>appXXXXXXXXXXXXXX</code></p>
          <p className="mt-1 text-sm text-red-600 font-medium">Common errors:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-red-600">
            <li>Using a workspace ID instead of a Base ID</li>
            <li>Missing or incorrect table field names</li>
            <li>403 Forbidden - API token doesn't have access to the base</li>
            <li>401 Unauthorized - Invalid API token</li>
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
            <Label htmlFor="airtableApiKey">API Token</Label>
            <Input
              id="airtableApiKey"
              value={credentials.airtableApiKey}
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
              value={credentials.airtableBaseId}
              onChange={(e) => onCredentialChange('airtableBaseId', e.target.value)}
              placeholder="Enter Airtable Base ID (appXXXXXXXX)"
              className={!isValidBaseId(credentials.airtableBaseId) && credentials.airtableBaseId ? "border-red-300" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Find in your base URL: airtable.com/{credentials.airtableBaseId ? credentials.airtableBaseId : 'appXXXXXXXX'}/...
            </p>
            {credentials.airtableBaseId && !isValidBaseId(credentials.airtableBaseId) && (
              <p className="text-xs text-red-500">
                Invalid format. Base ID should start with "app" followed by 14-17 alphanumeric characters.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="airtableTableName">Table Name</Label>
            <Input
              id="airtableTableName"
              value={credentials.airtableTableName}
              onChange={(e) => onCredentialChange('airtableTableName', e.target.value)}
              placeholder="Enter Airtable Table Name"
            />
            <p className="text-xs text-muted-foreground">
              The exact name of your table (case-sensitive)
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={isValidating}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default APICredentialsForm;
