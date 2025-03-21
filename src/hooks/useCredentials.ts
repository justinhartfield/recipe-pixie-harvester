
import { useState, useEffect } from 'react';
import { APICredentials } from '@/utils/types';

export const useCredentials = () => {
  const [isCredentialsSet, setIsCredentialsSet] = useState(false);

  // Check for credentials on load
  useEffect(() => {
    const bunnyStorageAccessKey = localStorage.getItem('bunnyStorageAccessKey');
    const bunnyStorageName = localStorage.getItem('bunnyStorageName');
    const openaiApiKey = localStorage.getItem('openaiApiKey');
    const airtableApiKey = localStorage.getItem('airtableApiKey');
    const airtableBaseId = localStorage.getItem('airtableBaseId');
    const airtableTableName = localStorage.getItem('airtableTableName');

    const hasCredentials = !!(
      bunnyStorageAccessKey && 
      bunnyStorageName && 
      openaiApiKey && 
      airtableApiKey && 
      airtableBaseId && 
      airtableTableName
    );

    setIsCredentialsSet(hasCredentials);
  }, []);

  const handleCredentialsUpdate = (credentials: APICredentials) => {
    setIsCredentialsSet(true);
  };

  return {
    isCredentialsSet,
    handleCredentialsUpdate
  };
};
