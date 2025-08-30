import * as React from "react";

export interface Configuration {
  publicUrl: string;
  mode: string;
  isDev: boolean;
  isProd: boolean;
  platforms: {
    web: { url: string; defaultImage: string };
    admin: { url: string };
    api: { url: string };
  };
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
}

export const defaultConfiguration: Configuration = {
  publicUrl: "https://lies.exposed",
  mode: "production",
  isDev: true,
  isProd: false,
  platforms: {
    web: {
      url: "https://lies.exposed",
      defaultImage: `https://lies.exposed/liexp-logo-1200x630.png`,
    },
    admin: { url: "https://lies.exposed/admin/" },
    api: { url: "https://api.lies.exposed/v1" },
  },
  site: {
    siteMetadata: {
      title: "Lies Exposed",
      description:
        "A chronological exposure of lies perpetrated against humanity.",
      author: "lies.exposed",
    },
  },
};

export const ConfigurationContext =
  React.createContext<Configuration>(defaultConfiguration);

export const useConfiguration = (): Configuration => {
  return React.useContext(ConfigurationContext);
};
