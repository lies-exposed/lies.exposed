/**
 * Type definition for a server route
 * Matches the structure used in routes.tsx
 */
export interface ServerRoute {
  path: string;
  route: React.ComponentType<any>;
  queries?: (
    queryProvider: any,
    config: any,
  ) => (params: any) => Promise<any[]>;
}

/**
 * Options for deriving client routes from server routes
 */
export interface DeriveClientRoutesOptions {
  /**
   * Modules that should not be lazy-loaded (e.g., root layouts, persistent UI)
   * @default []
   */
  excludeFromLazy?: string[];
}

/**
 * Documentation utility to extract module paths from route definitions
 *
 * Useful for understanding which modules are being imported by routes
 *
 * @example
 * ```ts
 * const paths = extractModulePathsFromRoutes(routes);
 * // Returns: ["./pages/ActorsPage.js", "./templates/ActorTemplate.js", ...]
 * ```
 */
export const extractModulePathsFromRoutes = (
  routes: ServerRoute[],
): string[] => {
  const paths: string[] = [];

  for (const route of routes) {
    const componentString = route.route.toString();

    // Match import statements like: import("./pages/ActorsPage.js")
    const importMatches = componentString.match(
      /import\(\s*["']([^"']+)["']\s*\)/g,
    );
    if (importMatches) {
      importMatches.forEach((match) => {
        const pathMatch = /["']([^"']+)["']/.exec(match);
        if (pathMatch?.[1]) {
          paths.push(pathMatch[1]);
        }
      });
    }
  }

  return [...new Set(paths)]; // Remove duplicates
};
