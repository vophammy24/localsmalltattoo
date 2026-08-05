import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getBusinessSettings } from "./api/businessSettingsApi";
import type { BusinessSettings } from "./types/businessSettings";
const Context = createContext<{
  settings?: BusinessSettings;
  isLoading: boolean;
  refresh: () => Promise<void>;
}>({ isLoading: true, refresh: async () => undefined });
export function BusinessSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>();
  const [isLoading, setIsLoading] = useState(true);
  async function refresh() {
    try {
      setSettings(await getBusinessSettings());
    } catch (error) {
      console.warn(
        "Business settings are temporarily unavailable.",
        error instanceof Error ? error.message : error,
      );
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, []);
  const value = useMemo(() => ({ settings, isLoading, refresh }), [settings, isLoading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useBusinessSettings() {
  return useContext(Context);
}
