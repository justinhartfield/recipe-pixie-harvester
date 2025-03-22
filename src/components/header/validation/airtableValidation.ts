
/**
 * Utilities for validating Airtable credentials
 */

/**
 * Validates Airtable Base ID format (should be appXXXXXXXXXXXXXX)
 */
export const isValidBaseId = (baseId: string): boolean => {
  return /^app[a-zA-Z0-9]{14,17}$/.test(baseId);
};

/**
 * Sets up console log capture for debugging API calls
 */
export const setupLogCapture = (originalConsoleLog: React.MutableRefObject<typeof console.log>) => {
  const logs: string[] = [];
  console.log = (...args) => {
    originalConsoleLog.current(...args);
    logs.push(args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' '));
  };
  return logs;
};

/**
 * Restores the original console.log function
 */
export const restoreConsoleLog = (originalConsoleLog: React.MutableRefObject<typeof console.log>) => {
  console.log = originalConsoleLog.current;
};
