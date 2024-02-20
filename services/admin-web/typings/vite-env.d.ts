import "vite/client";

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_WEB_URL: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
