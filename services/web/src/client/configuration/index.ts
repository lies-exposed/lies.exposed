import {
  type Configuration,
  defaultConfiguration,
} from "@liexp/ui/lib/context/ConfigurationContext.js";

export const configuration: Configuration = {
  ...defaultConfiguration,
  mode: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  publicUrl: process.env.PUBLIC_URL,
  platforms: {
    web: {
      defaultImage: `${process.env.PUBLIC_URL}/assets/liexp-logo-1200x630.png`,
      url: process.env.PUBLIC_URL,
    },
    admin: {
      url: process.env.ADMIN_URL,
    },
    api: {
      url: process.env.API_URL,
    },
  },
};
