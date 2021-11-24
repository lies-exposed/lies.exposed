declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly DEBUG: string;
    readonly API_URL: string;
    readonly DATA_URL: string;
  }
}
