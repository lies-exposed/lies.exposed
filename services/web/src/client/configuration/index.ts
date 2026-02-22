import {
  type Configuration,
  defaultConfiguration,
} from "@liexp/ui/lib/context/ConfigurationContext.js";

// Get API URL with current page's protocol to avoid mixed content issues
const getApiUrl = (): string => {
  const configUrl = import.meta.env.VITE_API_URL;
  if (typeof window === "undefined") {
    // SSR - use environment variable as-is
    return configUrl;
  }
  // Client-side: use same protocol as current page
  const protocol = window.location.protocol;
  // Extract host from config URL (e.g., "api.liexp.dev/v1" from "http://api.liexp.dev/v1")
  const urlObj = new URL(configUrl, "http://example.com");
  return `${protocol}//${urlObj.host}${urlObj.pathname}`;
};

export const configuration: Configuration = {
  ...defaultConfiguration,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  publicUrl: import.meta.env.VITE_PUBLIC_URL,
  platforms: {
    web: {
      defaultImage: `${import.meta.env.VITE_PUBLIC_URL}/liexp-logo-1200x630.png`,
      url: import.meta.env.VITE_PUBLIC_URL,
    },
    admin: {
      url: import.meta.env.VITE_ADMIN_URL,
    },
    api: {
      url: getApiUrl(),
    },
  },
  version: {
    version: import.meta.env.VITE_VERSION ?? "0.0.0",
    commitHash: import.meta.env.VITE_COMMIT_HASH ?? "unknown",
    githubUrl: "https://github.com/lies-exposed/lies-exposed",
  },
};
