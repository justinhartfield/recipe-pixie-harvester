
import Logo from './Logo';
import SettingsDialog from './SettingsDialog';
import { APICredentials } from '@/utils/types';

interface HeaderProps {
  onCredentialsUpdate: (credentials: APICredentials) => void;
  apiRateLimit: number;
  onRateLimitChange: (value: number) => void;
}

const Header = ({
  onCredentialsUpdate,
  apiRateLimit,
  onRateLimitChange,
}: HeaderProps) => {
  const credentials: APICredentials = {
    bunnyStorageAccessKey: localStorage.getItem('bunnyStorageAccessKey') || '',
    bunnyStorageName: localStorage.getItem('bunnyStorageName') || '',
    bunnyStorageRegion: localStorage.getItem('bunnyStorageRegion') || 'de',
    bunnyPullZoneId: localStorage.getItem('bunnyPullZoneId') || '',
    openaiApiKey: localStorage.getItem('openaiApiKey') || '',
    airtableApiKey: localStorage.getItem('airtableApiKey') || '',
    airtableBaseId: localStorage.getItem('airtableBaseId') || '',
    airtableTableName: localStorage.getItem('airtableTableName') || '',
  };

  return (
    <header className="w-full py-6 px-8 border-b border-border animate-fade-in">
      <div className="container max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <Logo />

        <div className="flex items-center gap-3">
          <SettingsDialog
            credentials={credentials}
            onCredentialsUpdate={onCredentialsUpdate}
            apiRateLimit={apiRateLimit}
            onRateLimitChange={onRateLimitChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
