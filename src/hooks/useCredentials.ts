
import { useState, useEffect } from 'react';
import { APICredentials } from '@/utils/types';

export const useCredentials = () => {
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [credentials, setCredentials] = useState<APICredentials>({
    openaiApiKey: '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',
    airtableApiKey: 'patAgalgn8IqCFf3m.3f0943fc1bad5e63e785e4f081811e437d6a705b1f226f385344922fb418d986',
    airtableBaseId: '',
    airtableTableName: '',
  });

  // Check for credentials on load
  useEffect(() => {
    const openaiApiKey = localStorage.getItem('openaiApiKey') || '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';
    const airtableApiKey = localStorage.getItem('airtableApiKey') || 'patAgalgn8IqCFf3m.3f0943fc1bad5e63e785e4f081811e437d6a705b1f226f385344922fb418d986';
    const airtableBaseId = localStorage.getItem('airtableBaseId') || '';
    const airtableTableName = localStorage.getItem('airtableTableName') || '';

    // Log for debugging
    console.log('Credentials loaded from localStorage:', {
      hasOpenAIKey: !!openaiApiKey,
      hasAirtableKey: !!airtableApiKey,
      hasAirtableBaseId: !!airtableBaseId,
      hasAirtableTableName: !!airtableTableName
    });

    const hasCredentials = !!(
      openaiApiKey && 
      airtableApiKey && 
      airtableBaseId && 
      airtableTableName
    );

    setIsCredentialsSet(hasCredentials);
    
    // Set credentials
    setCredentials({
      openaiApiKey,
      airtableApiKey,
      airtableBaseId,
      airtableTableName,
    });
  }, []);

  const handleCredentialsUpdate = (newCredentials: APICredentials) => {
    // Log for debugging
    console.log('Updating credentials:', {
      hasOpenAIKey: !!newCredentials.openaiApiKey,
      hasAirtableKey: !!newCredentials.airtableApiKey,
      hasAirtableBaseId: !!newCredentials.airtableBaseId,
      hasAirtableTableName: !!newCredentials.airtableTableName
    });

    setCredentials(newCredentials);
    setIsCredentialsSet(true);
  };

  return {
    isCredentialsSet,
    credentials,
    handleCredentialsUpdate
  };
};
