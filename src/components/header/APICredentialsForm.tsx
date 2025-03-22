
import { useState } from 'react';
import { APICredentials } from '@/utils/types';
import { useCredentialValidation } from '@/hooks/useCredentialValidation';
import ValidationLogs from './validation/ValidationLogs';
import AirtableRequirements from './info/AirtableRequirements';
import TokenPermissionInfo from './info/TokenPermissionInfo';
import OpenAISection from './form-sections/OpenAISection';
import AirtableSection from './form-sections/AirtableSection';
import FormActions from './form-sections/FormActions';

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
  const {
    isValidating,
    validationError,
    validationLogs,
    showLogs,
    setShowLogs,
    validateCredentials
  } = useCredentialValidation();

  const handleSave = async () => {
    await validateCredentials(credentials, onSave);
  };

  return (
    <div className="grid gap-6 py-4">
      <ValidationLogs
        validationError={validationError}
        validationLogs={validationLogs}
        showLogs={showLogs}
        setShowLogs={setShowLogs}
      />
      
      <AirtableRequirements />
      
      <TokenPermissionInfo />
      
      <OpenAISection 
        openaiApiKey={credentials.openaiApiKey}
        onCredentialChange={onCredentialChange}
      />
      
      <AirtableSection
        airtableApiKey={credentials.airtableApiKey}
        airtableBaseId={credentials.airtableBaseId}
        airtableTableName={credentials.airtableTableName}
        onCredentialChange={onCredentialChange}
      />

      <FormActions
        isValidating={isValidating}
        onCancel={onCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default APICredentialsForm;
