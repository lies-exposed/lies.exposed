declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly API_URL: string;
    readonly DATA_URL: string;
    readonly ADMIN_URL: string;
  }
}
