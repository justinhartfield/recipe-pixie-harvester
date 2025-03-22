
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { APICredentials } from '@/utils/types';
import { initOpenAIVision } from '@/services/openaiService';
import { initAirtable } from '@/services/airtableService';
import { isValidBaseId, setupLogCapture, restoreConsoleLog } from '@/components/header/validation/airtableValidation';

export const useCredentialValidation = () => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationLogs, setValidationLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const originalConsoleLog = useRef(console.log);

  const validateCredentials = async (credentials: APICredentials, onSuccess: () => void) => {
    // Reset validation state
    setValidationError(null);
    setValidationLogs([]);
    setShowLogs(false);

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
      
      // Capture console logs during validation
      const logs = setupLogCapture(originalConsoleLog);
      
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
      
      // Restore console.log
      restoreConsoleLog(originalConsoleLog);
      
      // Set validation logs
      setValidationLogs(logs);
      
      if (!airtableValidation.valid) {
        setValidationError(airtableValidation.error || "Failed to validate Airtable configuration");
        setShowLogs(true);
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
      onSuccess();
    } catch (error) {
      console.error('Error initializing services:', error);
      setIsValidating(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize services";
      setValidationError(errorMessage);
      setShowLogs(true);
      toast({
        title: "Configuration error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Restore console.log in case of error
      restoreConsoleLog(originalConsoleLog);
    }
  };

  return {
    isValidating,
    validationError,
    validationLogs,
    showLogs,
    setShowLogs,
    validateCredentials
  };
};
