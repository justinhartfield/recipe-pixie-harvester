
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
    setCredentials(newCredentials);
    setIsCredentialsSet(true);
  };

  return {
    isCredentialsSet,
    credentials,
    handleCredentialsUpdate
  };
};
