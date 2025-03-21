
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RateLimitSettingProps {
  apiRateLimit: number;
  onRateLimitChange: (value: number) => void;
}

const RateLimitSetting = ({ apiRateLimit, onRateLimitChange }: RateLimitSettingProps) => {
  return (
    <div className="grid gap-2">
      <h3 className="text-lg font-medium">Rate Limiting</h3>
      <div className="space-y-2">
        <Label htmlFor="apiRateLimit">API Request Delay (seconds)</Label>
        <Input
          id="apiRateLimit"
          type="number"
          min="1"
          max="60"
          value={apiRateLimit / 1000}
          onChange={(e) => onRateLimitChange(parseInt(e.target.value, 10) * 1000)}
          placeholder="Enter delay in seconds"
        />
        <p className="text-sm text-muted-foreground">Minimum delay between API requests.</p>
      </div>
    </div>
  );
};

export default RateLimitSetting;
