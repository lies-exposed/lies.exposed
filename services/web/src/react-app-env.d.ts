/// <reference types="react-scripts" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly REACT_APP_DEBUG: string;
    readonly REACT_APP_API_URL: string;
  }
} /// <reference types="react-scripts" />
