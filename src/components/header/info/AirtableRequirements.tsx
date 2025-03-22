
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const AirtableRequirements = () => {
  return (
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
  );
};

export default AirtableRequirements;
