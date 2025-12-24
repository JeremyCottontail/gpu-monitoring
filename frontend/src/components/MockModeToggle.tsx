import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";

export const MockModeToggle = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('mockModeEnabled');
    if (savedPreference !== null) {
      setEnabled(savedPreference === 'true');
    } else {
      // Default to enabled in development (using a fallback)
      setEnabled(false);
    }
  }, []);

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('mockModeEnabled', enabled.toString());

    // Apply class to body for styling if needed
    if (enabled) {
      document.body.classList.add('mock-mode');
    } else {
      document.body.classList.remove('mock-mode');
    }
  }, [enabled]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-300">Mock Mode</span>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${enabled ? 'bg-accent-500' : 'bg-slate-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
      >
        <span
          className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </Switch>
    </div>
  );
};