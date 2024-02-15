declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly VITE_PUBLIC_URL: string;
    readonly VITE_API_URL: string;
  }
}
