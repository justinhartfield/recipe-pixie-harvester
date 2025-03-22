
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const TokenPermissionInfo = () => {
  return (
    <Alert className="bg-yellow-50 border-yellow-200 mt-4">
      <AlertTitle>Airtable Token Permissions</AlertTitle>
      <AlertDescription>
        <p>Make sure your Airtable Personal Access Token has these permissions:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>data.records:read</strong> - To fetch records</li>
          <li><strong>data.records:write</strong> - To create new records</li>
          <li><strong>schema.bases:read</strong> - To validate base and table access</li>
        </ul>
        <p className="mt-2 text-sm">Tokens can be created at <a href="https://airtable.com/create/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://airtable.com/create/tokens</a></p>
      </AlertDescription>
    </Alert>
  );
};

export default TokenPermissionInfo;
