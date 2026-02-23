import * as fs from "fs";
import * as path from "path";

/**
 * Configuration for automatic chunk generation based on folder patterns
 */
export interface ChunkConfigOptions {
  /** Root directory to scan for pages and templates */
  pagesDir: string;
  /** Root directory to scan for templates */
  templatesDir: string;
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
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
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
 * Generates relative paths for manual chunk configuration
 * Converts absolute paths to paths relative to vite cwd
 */
const toRelativePath = (filePath: string, cwd: string): string => {
  const relative = path.relative(cwd, filePath);
  // Use .js extension for import resolution
  return `./${relative.replace(/\.(ts|tsx)$/, ".js")}`;
};

/**
 * Auto-generates rollupOptions.output.manualChunks based on folder structure
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
  cwd?: string,
): Record<string, unknown> => {
  const {
    pagesDir,
    templatesDir,
    folderToChunkMap = {},
    chunkPrefix = "chunk-",
  } = options;

  const workingDir = cwd ?? process.cwd();

  // Get all page and template files
  const pageFiles = getFilesInDir(pagesDir);
  const templateFiles = getFilesInDir(templatesDir);

  // Group files by their context folder
  const pagesByContext = groupFilesByContext(pageFiles);
  const templatesByContext = groupFilesByContext(templateFiles);

  // Generate manual chunks
  const manualChunks: Record<string, string[]> = {};

  // Process pages grouped by context
  for (const [context, files] of Object.entries(pagesByContext)) {
    if (context === "root") {
      // Root pages (ActorsPage, GroupsPage, etc.) stay ungrouped
      // Vite will auto-chunk them if they're large enough
      continue;
    }

    const chunkName = generateChunkName(context, chunkPrefix, folderToChunkMap);
    manualChunks[chunkName] = files.map((f) =>
      toRelativePath(f.filePath, workingDir),
    );
  }

  // Process templates grouped by context
  for (const [context, files] of Object.entries(templatesByContext)) {
    if (context === "root") {
      // Root templates - group them together
      const chunkName = `${chunkPrefix}templates`;
      if (!manualChunks[chunkName]) {
        manualChunks[chunkName] = [];
      }
      manualChunks[chunkName].push(
        ...files.map((f) => toRelativePath(f.filePath, workingDir)),
      );
      continue;
    }

    // For contextualized templates (e.g., events), add to existing context chunk
    const chunkName = generateChunkName(context, chunkPrefix, folderToChunkMap);
    if (!manualChunks[chunkName]) {
      manualChunks[chunkName] = [];
    }
    manualChunks[chunkName].push(
      ...files.map((f) => toRelativePath(f.filePath, workingDir)),
    );
  }

  // Add vendor chunks - only reference actual modules, not directories
  const vendorChunks = {
    "vendor-react": [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
    ],
    "vendor-mui": [
      "@mui/material",
      "@mui/icons-material",
      "@mui/system",
      "@mui/lab",
    ],
    "vendor-query": ["@tanstack/react-query"],
    "vendor-form": ["react-hook-form"],
    "vendor-ui-lib": ["@liexp/ui"],
    "vendor-shared": ["@liexp/shared"],
    "chunk-editor": ["@blocknote/core", "@blocknote/react"],
  };

  return {
    output: {
      manualChunks: {
        ...vendorChunks,
        ...manualChunks,
      },
    },
  };
};
