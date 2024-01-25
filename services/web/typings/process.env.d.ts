declare namespace NodeJS {
  interface ProcessEnv {
    readonly VIRTUAL_HOST: string;
    readonly VIRTUAL_PORT: string;

    readonly VITE_NODE_ENV: "development" | "production" | "test";
    readonly VITE_DEBUG: string;
    readonly VITE_PUBLIC_URL: string;
    readonly VITE_API_URL: string;
    readonly VITE_SSR_API_URL: string;
    readonly VITE_DATA_URL: string;
    readonly VITE_ADMIN_URL: string;
  }
}
