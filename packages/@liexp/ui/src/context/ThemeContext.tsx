import * as React from "react";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: "light" | "dark";
}

export const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined,
);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

const THEME_STORAGE_KEY = "theme-mode";

const getSystemPreference = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = "dark",
}) => {
  const [mode, setModeState] = React.useState<ThemeMode>(defaultMode);
  const [systemPreference, setSystemPreference] = React.useState<
    "light" | "dark"
  >(getSystemPreference());
  const [isClient, setIsClient] = React.useState(false);

  // Initialize from localStorage on client and listen for system preference changes
  React.useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setModeState(stored);
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };

    // Modern way to listen
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    return undefined;
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  const resolvedMode = isClient
    ? mode === "system"
      ? systemPreference
      : mode
    : "light";

  const value: ThemeContextType = {
    mode,
    setMode,
    resolvedMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeMode = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeMode must be used within a ThemeContextProvider");
  }
  return context;
};
