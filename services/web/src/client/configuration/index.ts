import {
  type Configuration,
  defaultConfiguration,
} from "@liexp/ui/lib/context/ConfigurationContext.js";

export const configuration: Configuration = {
  ...defaultConfiguration,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  publicUrl: import.meta.env.VITE_PUBLIC_URL,
  platforms: {
    web: {
      defaultImage: `${import.meta.env.VITE_PUBLIC_URL}/assets/liexp-logo-1200x630.png`,
      url: import.meta.env.VITE_PUBLIC_URL,
    },
    admin: {
      url: import.meta.env.VITE_ADMIN_URL,
    },
    api: {
      url: import.meta.env.VITE_API_URL,
    },
  },
};
