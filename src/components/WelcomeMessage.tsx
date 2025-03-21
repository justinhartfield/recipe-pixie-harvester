
import React from 'react';

const WelcomeMessage: React.FC = () => {
  return (
    <div className="glass-light dark:glass-dark p-6 rounded-lg max-w-2xl mx-auto text-center animate-fade-in">
      <h2 className="text-xl font-medium mb-3">Welcome to Recipe Vision</h2>
      <p className="text-muted-foreground mb-4">
        This application processes recipe images through AI vision analysis and stores the data in Airtable.
      </p>
      <p className="mb-4">
        To begin, click the <strong>Settings</strong> button above to configure your API credentials.
      </p>
      <div className="text-sm text-muted-foreground">
        You'll need:
        <ul className="mt-2 space-y-1">
          <li>Bunny.net Storage credentials</li>
          <li>OpenAI API key</li>
          <li>Airtable API key, Base ID, and Table Name</li>
        </ul>
      </div>
    </div>
  );
};

export default WelcomeMessage;
