
import { useState, useEffect } from 'react';
import { APICredentials } from '@/utils/types';

export const useCredentials = () => {
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [credentials, setCredentials] = useState<APICredentials>({
    openaiApiKey: '',
    airtableApiKey: '',
    airtableBaseId: '',
    airtableTableName: '',
  });

  // Check for credentials on load
  useEffect(() => {
    const openaiApiKey = localStorage.getItem('openaiApiKey') || '';
    const airtableApiKey = localStorage.getItem('airtableApiKey') || '';
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
