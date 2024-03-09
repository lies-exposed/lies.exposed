import "vite/client";

interface ImportMetaEnv {
  readonly VITE_NODE_ENV: "development" | "production" | "test";
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_ADMIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
