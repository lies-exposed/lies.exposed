declare module "vite-plugin-optimizer" {
  import { Plugin } from "vite";

  var vitePluginOptimizer: (options: any) => Plugin;
  export = vitePluginOptimizer;
}
