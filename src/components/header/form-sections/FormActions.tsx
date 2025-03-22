
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface FormActionsProps {
  isValidating: boolean;
  onCancel: () => void;
  onSave: () => void;
}

const FormActions = ({ isValidating, onCancel, onSave }: FormActionsProps) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={onCancel} disabled={isValidating}>
        Cancel
      </Button>
      <Button onClick={onSave} disabled={isValidating}>
        {isValidating ? (
          <>
            <span className="mr-2">Validating...</span>
            <Spinner size="sm" />
          </>
        ) : 'Save Changes'}
      </Button>
    </div>
  );
};

export default FormActions;
