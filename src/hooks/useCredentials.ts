
import { useState, useEffect } from 'react';
import { APICredentials } from '@/utils/types';

// Default values from environment variables if available
const DEFAULT_OPENAI_API_KEY = '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';
const DEFAULT_AIRTABLE_API_KEY = 'patAgalgn8IqCFf3m.3f0943fc1bad5e63e785e4f081811e437d6a705b1f226f385344922fb418d986';

export const useCredentials = () => {
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [credentials, setCredentials] = useState<APICredentials>({
    bunnyStorageAccessKey: '',
    bunnyStorageName: '',
    bunnyStorageRegion: 'de',
    bunnyPullZoneId: '',
    openaiApiKey: DEFAULT_OPENAI_API_KEY || '',
    airtableApiKey: DEFAULT_AIRTABLE_API_KEY || '',
    airtableBaseId: '',
    airtableTableName: '',
  });

  // Check for credentials on load
  useEffect(() => {
    const bunnyStorageAccessKey = localStorage.getItem('bunnyStorageAccessKey') || '';
    const bunnyStorageName = localStorage.getItem('bunnyStorageName') || '';
    const bunnyStorageRegion = localStorage.getItem('bunnyStorageRegion') || 'de';
    const bunnyPullZoneId = localStorage.getItem('bunnyPullZoneId') || '';
    const openaiApiKey = localStorage.getItem('openaiApiKey') || DEFAULT_OPENAI_API_KEY || '';
    const airtableApiKey = localStorage.getItem('airtableApiKey') || DEFAULT_AIRTABLE_API_KEY || '';
    const airtableBaseId = localStorage.getItem('airtableBaseId') || '';
    const airtableTableName = localStorage.getItem('airtableTableName') || '';

    // Log for debugging
    console.log('Credentials loaded from localStorage:', {
      hasBunnyKey: !!bunnyStorageAccessKey,
      bunnyStorageName,
      bunnyStorageRegion,
      hasBunnyPullZoneId: !!bunnyPullZoneId,
      hasOpenAIKey: !!openaiApiKey,
      hasAirtableKey: !!airtableApiKey,
      hasAirtableBaseId: !!airtableBaseId,
      hasAirtableTableName: !!airtableTableName
    });

    const hasCredentials = !!(
      bunnyStorageAccessKey && 
      bunnyStorageName && 
      openaiApiKey && 
      airtableApiKey && 
      airtableBaseId && 
      airtableTableName
    );

    setIsCredentialsSet(hasCredentials);
    
    // Set credentials
    setCredentials({
      bunnyStorageAccessKey,
      bunnyStorageName,
      bunnyStorageRegion,
      bunnyPullZoneId,
      openaiApiKey,
      airtableApiKey,
      airtableBaseId,
      airtableTableName,
    });
  }, []);

  const handleCredentialsUpdate = (newCredentials: APICredentials) => {
    // Log for debugging
    console.log('Updating credentials:', {
      hasBunnyKey: !!newCredentials.bunnyStorageAccessKey,
      bunnyStorageName: newCredentials.bunnyStorageName,
      bunnyStorageRegion: newCredentials.bunnyStorageRegion,
      hasBunnyPullZoneId: !!newCredentials.bunnyPullZoneId,
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
