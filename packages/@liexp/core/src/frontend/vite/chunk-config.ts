import * as fs from "fs";
import * as path from "path";

/**
 * Configuration for automatic chunk generation based on folder patterns
 */
export interface ChunkConfigOptions {
  /** Root directory to scan for pages and templates */
  pagesDir: string;
  /** Root directory to scan for templates */
  templatesDir?: string;
  /** Map folder names to chunk names (e.g., "events" -> "chunk-events") */
  folderToChunkMap?: Record<string, string>;
  /** Default chunk name prefix (e.g., "chunk-") */
  chunkPrefix?: string;
}

/**
 * Module info extracted from a file
 */
interface ModuleInfo {
  fileName: string;
  filePath: string;
  name: string;
}

/**
 * Reads all files from a directory recursively
 */
const getFilesInDir = (dir: string): ModuleInfo[] => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files: ModuleInfo[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip test directories and hidden directories
      if (entry.name === "__tests__" || entry.name.startsWith(".")) {
        continue;
      }
      files.push(...getFilesInDir(fullPath));
    } else if (
      entry.isFile() &&
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test)\.(ts|tsx)$/.test(entry.name)
    ) {
      files.push({
        fileName: entry.name,
        filePath: fullPath,
        name: entry.name.replace(/\.(ts|tsx)$/, ""),
      });
    }
  }

  return files;
};

/**
 * Extracts the semantic folder from a file path
 * e.g., "src/client/pages/events/EventsPage.tsx" -> "events"
 */
const getFolderContext = (filePath: string): string | null => {
  const parts = filePath.split(path.sep);
  const pagesDirIndex = parts.findIndex((p) => p === "pages");
  const templatesDirIndex = parts.findIndex((p) => p === "templates");

  const startIndex = pagesDirIndex >= 0 ? pagesDirIndex : templatesDirIndex;

  if (startIndex >= 0 && startIndex + 1 < parts.length) {
    const nextPart = parts[startIndex + 1];
    // Return next folder if it's not a file
    if (!nextPart.includes(".")) {
      return nextPart;
    }
  }

  return null;
};

/**
 * Groups files by their semantic folder context
 */
const groupFilesByContext = (
  files: ModuleInfo[],
): Record<string, ModuleInfo[]> => {
  const groups: Record<string, ModuleInfo[]> = {
    root: [],
  };

  for (const file of files) {
    const context = getFolderContext(file.filePath);
    const key = context ?? "root";

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  }

  return groups;
};

/**
 * Generates chunk name for a context folder
 */
const generateChunkName = (
  context: string,
  chunkPrefix: string,
  folderMap?: Record<string, string>,
): string => {
  // Check if there's a custom mapping
  if (folderMap?.[context]) {
    return folderMap[context];
  }

  // Otherwise generate from folder name
  return `${chunkPrefix}${context}`;
};

/**
 * Auto-generates rollupOptions.output.manualChunks based on folder structure.
 *
 * Returns the function form of manualChunks (required by Vite 8 / rolldown —
 * the object form was removed in https://vite.dev/guide/migration#removed-object-form-build-rollupoptions-output-manualchunks-and-deprecate-function-form-one).
 *
 * @example
 * ```ts
 * const rollupOptions = generateChunkConfig({
 *   pagesDir: path.join(process.cwd(), "src/client/pages"),
 *   templatesDir: path.join(process.cwd(), "src/client/templates"),
 *   chunkPrefix: "chunk-",
 *   folderToChunkMap: {
 *     "events": "chunk-events-detailed",
 *   }
 * })
 * ```
 */
export const generateChunkConfig = (
  options: ChunkConfigOptions,
  _cwd?: string,
): Record<string, unknown> => {
  const {
    pagesDir,
    templatesDir,
    folderToChunkMap = {},
    chunkPrefix = "chunk-",
  } = options;

  // Get all page and template files
  const pageFiles = getFilesInDir(pagesDir);
  const templateFiles = templatesDir ? getFilesInDir(templatesDir) : [];

  // Group files by their context folder
  const pagesByContext = groupFilesByContext(pageFiles);
  const templatesByContext = groupFilesByContext(templateFiles);

  // Build a map from absolute file path -> chunk name
  const fileToChunk = new Map<string, string>();

  // Process pages grouped by context
  for (const [context, files] of Object.entries(pagesByContext)) {
    if (context === "root") {
      // Root pages stay ungrouped; Vite auto-chunks them if large enough
      continue;
    }

    const chunkName = generateChunkName(context, chunkPrefix, folderToChunkMap);
    for (const f of files) {
      fileToChunk.set(f.filePath, chunkName);
    }
  }

  // Process templates grouped by context
  for (const [context, files] of Object.entries(templatesByContext)) {
    const chunkName =
      context === "root"
        ? `${chunkPrefix}templates`
        : generateChunkName(context, chunkPrefix, folderToChunkMap);

    for (const f of files) {
      fileToChunk.set(f.filePath, chunkName);
    }
  }

  // Note: Vendor chunks are not included here because:
  // 1. In SSR builds, vendors are externalized and should not be in manualChunks
  // 2. In client builds, Vite's native chunking handles vendors efficiently
  // 3. If you need custom vendor chunking for client builds only,
  //    implement it conditionally in vite.config.ts based on build environment

  return {
    output: {
      manualChunks: (id: string): string | undefined => {
        return fileToChunk.get(id);
      },
    },
  };
};
