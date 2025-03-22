
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ValidationLogsProps {
  validationError: string | null;
  validationLogs: string[];
  showLogs: boolean;
  setShowLogs: (show: boolean) => void;
}

const ValidationLogs = ({ 
  validationError, 
  validationLogs, 
  showLogs, 
  setShowLogs 
}: ValidationLogsProps) => {
  if (!validationError) return null;
  
  return (
    <>
      <Alert variant="destructive">
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>{validationError}</AlertDescription>
        {validationLogs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? "Hide Validation Logs" : "Show Validation Logs"}
          </Button>
        )}
      </Alert>
      
      {showLogs && validationLogs.length > 0 && (
        <div className="bg-slate-100 p-3 rounded text-xs font-mono overflow-auto max-h-40">
          {validationLogs.map((log, i) => (
            <div key={i} className="whitespace-pre-wrap">{log}</div>
          ))}
        </div>
      )}
    </>
  );
};

export default ValidationLogs;
