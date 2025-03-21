
import { useState, useEffect } from 'react';
import { APICredentials } from '@/utils/types';

export const useCredentials = () => {
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);
  const [credentials, setCredentials] = useState<APICredentials>({
    bunnyStorageAccessKey: '',
    bunnyStorageName: '',
    bunnyStorageRegion: 'de',
    openaiApiKey: '',
    airtableApiKey: '',
    airtableBaseId: '',
    airtableTableName: '',
  });

  // Check for credentials on load
  useEffect(() => {
    const bunnyStorageAccessKey = localStorage.getItem('bunnyStorageAccessKey') || '';
    const bunnyStorageName = localStorage.getItem('bunnyStorageName') || '';
    const bunnyStorageRegion = localStorage.getItem('bunnyStorageRegion') || 'de';
    const openaiApiKey = localStorage.getItem('openaiApiKey') || '';
    const airtableApiKey = localStorage.getItem('airtableApiKey') || '';
    const airtableBaseId = localStorage.getItem('airtableBaseId') || '';
    const airtableTableName = localStorage.getItem('airtableTableName') || '';

    // Log for debugging
    console.log('Credentials loaded from localStorage:', {
      hasBunnyKey: !!bunnyStorageAccessKey,
      bunnyStorageName,
      bunnyStorageRegion,
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
