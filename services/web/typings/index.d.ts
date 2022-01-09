
declare module "*.jpg" {
  const jpg: string;
  export = jpg
  export default jpg
}

declare module "*.png" {
  const png: string;
  export = png;
  export default png;
}

declare module "*.svg" {
  const svg: string;
  export = svg;
  export default svg;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PUBLIC_URL: string;
    readonly DEBUG: string;
    readonly API_URL: string;
    readonly DATA_URL: string;
  }
}