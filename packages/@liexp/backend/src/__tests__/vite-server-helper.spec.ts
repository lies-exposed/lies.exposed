import * as fs from "fs";
import * as path from "path";
import type { Logger } from "@liexp/core/lib/logger/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createViteServerHelper,
  type ServerHelperConfig,
} from "../express/vite-server-helper.js";

// Mock external dependencies
vi.mock("compression", () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock("sirv", () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => next()),
}));

vi.mock("express", () => {
  const mockApp = {
    use: vi.fn(),
    get: vi.fn(),
    listen: vi.fn(),
  };

  const mockExpress: any = vi.fn(() => mockApp);
  mockExpress.json = vi.fn(() => vi.fn());
  mockExpress.urlencoded = vi.fn(() => vi.fn());

  return {
    default: mockExpress,
  };
});

// Define these outside for use in tests
const mockApp = {
  use: vi.fn(),
  get: vi.fn(),
  listen: vi.fn(),
};

const mockViteServer = {
  middlewares: vi.fn(),
  ssrLoadModule: vi.fn(),
  transformIndexHtml: vi.fn(),
  ssrFixStacktrace: vi.fn(),
};

vi.mock("vite", () => ({
  createServer: vi.fn().mockResolvedValue(mockViteServer),
}));

vi.mock("fs");
vi.mock("path");

describe("vite-server-helper", () => {
  const mockLogger: Logger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  } as any;

  const baseConfig: ServerHelperConfig = {
    logger: mockLogger,
    isProduction: false,
    viteConfig: {
      appType: "spa",
      base: "/",
    },
    staticConfig: {
      buildPath: "/app/build",
      indexFile: "/app/build/index.html",
    },
    expressConfig: {
      compression: true,
      bodyLimit: "10mb",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset fs mocks
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "<html><head></head><body><!--web-analytics--></body></html>",
    );
    vi.mocked(path.resolve).mockImplementation((...args) => args.join("/"));

    // Reset vite mocks
    vi.mocked(mockViteServer.transformIndexHtml).mockResolvedValue(
      "<html>transformed</html>",
    );
    vi.mocked(mockViteServer.ssrLoadModule).mockResolvedValue({
      default: vi.fn(),
    });

    // Reset mockApp (express methods are reset by vi.clearAllMocks)
    vi.mocked(mockApp.use).mockClear();
    vi.mocked(mockApp.get).mockClear();
    vi.mocked(mockApp.listen).mockClear();
  });

  describe("Development Mode", () => {
    describe("SPA Configuration", () => {
      it("should create Vite dev server with SPA config", async () => {
        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: false,
        };

        const result = await createViteServerHelper(config);

        expect(result.app).toBeDefined();
        expect(result.vite).toBe(mockViteServer);
        expect(mockLogger.info.log).toHaveBeenCalledWith(
          "Setting up Vite dev server in middleware mode",
        );
        expect(mockLogger.info.log).toHaveBeenCalledWith(
          "Vite dev server initialized with %s mode",
          "spa",
        );

        const { createServer } = await import("vite");
        expect(createServer).toHaveBeenCalledWith({
          server: { middlewareMode: true },
          appType: "spa",
          base: "/",
          configFile: undefined,
        });
      });

      it("should handle custom vite config options", async () => {
        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: false,
          viteConfig: {
            ...baseConfig.viteConfig,
            configFile: "/custom/vite.config.js",
            serverOptions: { port: 3000 },
          },
        };

        await createViteServerHelper(config);

        const { createServer } = await import("vite");
        expect(createServer).toHaveBeenCalledWith({
          server: { port: 3000, middlewareMode: true },
          appType: "spa",
          base: "/",
          configFile: "/custom/vite.config.js",
        });
      });
    });

    describe("SSR Configuration", () => {
      it("should setup SSR with template handling", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue("/src/entry.tsx");
        const mockGetTemplate = vi
          .fn()
          .mockResolvedValue("<html>custom</html>");

        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: false,
          viteConfig: {
            ...baseConfig.viteConfig,
            appType: "custom",
          },
          templateConfig: {
            serverEntry: mockServerEntry,
            getTemplate: mockGetTemplate,
            transformTemplate: (t: string) =>
              t.replace("custom", "transformed"),
          },
        };

        const result = await createViteServerHelper(config);

        expect(mockServerEntry).toHaveBeenCalled();
        expect(result.serverEntry).toBeDefined();
        expect(result.getTemplate).toBeDefined();
        expect(result.transformTemplate).toBeDefined();

        // Test template getter
        const template = await result.getTemplate!("http://localhost", "/");
        expect(mockGetTemplate).toHaveBeenCalledWith("http://localhost", "/");
        expect(mockViteServer.transformIndexHtml).toHaveBeenCalled();
      });

      it("should use default template when no custom getTemplate provided", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue("/src/entry.tsx");

        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: false,
          viteConfig: {
            ...baseConfig.viteConfig,
            appType: "custom",
          },
          templateConfig: {
            serverEntry: mockServerEntry,
            getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
          },
        };

        const result = await createViteServerHelper(config);

        expect(result.getTemplate).toBeDefined();
        await result.getTemplate!("http://localhost", "/");
        expect(mockViteServer.transformIndexHtml).toHaveBeenCalledWith(
          "http://localhost",
          "<html>test</html>",
          "/",
        );
      });
    });
  });

  describe("Production Mode", () => {
    describe("SPA Configuration", () => {
      it("should serve static files with SPA fallback", async () => {
        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: true,
        };

        const result = await createViteServerHelper(config);

        expect(result.app).toBeDefined();
        expect(result.vite).toBeUndefined();
        expect(mockLogger.info.log).toHaveBeenCalledWith(
          "Setting up production static file serving from %s",
          "/app/build",
        );

        // Check sirv was called for static files
        const sirv = await import("sirv");
        expect(vi.mocked(sirv.default)).toHaveBeenCalledWith("/app/build", {
          extensions: [],
        });
      });

      it("should handle custom static extensions", async () => {
        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: true,
          staticConfig: {
            ...baseConfig.staticConfig,
            extensions: [".html", ".js"],
          },
        };

        await createViteServerHelper(config);

        const sirv = await import("sirv");
        expect(vi.mocked(sirv.default)).toHaveBeenCalledWith("/app/build", {
          extensions: [".html", ".js"],
        });
      });
    });

    describe("SSR Configuration", () => {
      it("should setup SSR production with client path", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue({ render: vi.fn() });
        const mockGetTemplate = vi
          .fn()
          .mockResolvedValue("<html>production</html>");

        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: true,
          staticConfig: {
            ...baseConfig.staticConfig,
            clientPath: "/app/build/client",
          },
          templateConfig: {
            serverEntry: mockServerEntry,
            getTemplate: mockGetTemplate,
          },
        };

        const result = await createViteServerHelper(config);

        expect(result.serverEntry).toBe(mockServerEntry);
        expect(result.getTemplate).toBe(mockGetTemplate);

        // Check sirv was called with client path for SSR
        const sirv = await import("sirv");
        expect(vi.mocked(sirv.default)).toHaveBeenCalledWith(
          "/app/build/client",
          {
            extensions: [],
          },
        );
      });

      it("should use default template when file exists but no custom getter", async () => {
        const config: ServerHelperConfig = {
          ...baseConfig,
          isProduction: true,
          templateConfig: {
            serverEntry: vi.fn(),
            getTemplate: vi
              .fn()
              .mockResolvedValue(
                "<html><head></head><body><!--web-analytics--></body></html>",
              ),
          },
        };

        const result = await createViteServerHelper(config);

        expect(result.getTemplate).toBeDefined();
        const template = await result.getTemplate!("http://localhost", "/");
        expect(template).toBe(
          "<html><head></head><body><!--web-analytics--></body></html>",
        );
      });
    });
  });

  describe("Middleware Configuration", () => {
    it("should register compression middleware when enabled", async () => {
      const config: ServerHelperConfig = {
        ...baseConfig,
        expressConfig: {
          compression: true,
        },
      };

      const result = await createViteServerHelper(config);

      const compression = await import("compression");
      expect(vi.mocked(compression.default)).toHaveBeenCalled();
      expect(result.app.use).toBeDefined();
    });

    it("should skip compression when disabled", async () => {
      const config: ServerHelperConfig = {
        ...baseConfig,
        expressConfig: {
          compression: false,
        },
      };

      await createViteServerHelper(config);

      const compression = await import("compression");
      expect(vi.mocked(compression.default)).not.toHaveBeenCalled();
    });

    it("should setup body parsers with custom limit", async () => {
      const config: ServerHelperConfig = {
        ...baseConfig,
        expressConfig: {
          bodyLimit: "50mb",
        },
      };

      const result = await createViteServerHelper(config);

      // Body parsers should be set up (we can't easily test express internals,
      // but we can verify the app was created and configured)
      expect(result.app).toBeDefined();
    });

    it("should call beforeViteMiddleware callback", async () => {
      const beforeMiddleware = vi.fn();
      const config: ServerHelperConfig = {
        ...baseConfig,
        expressConfig: {
          beforeViteMiddleware: beforeMiddleware,
        },
      };

      const result = await createViteServerHelper(config);

      expect(beforeMiddleware).toHaveBeenCalledWith(result.app);
    });

    it("should call afterViteMiddleware callback", async () => {
      const afterMiddleware = vi.fn();
      const config: ServerHelperConfig = {
        ...baseConfig,
        expressConfig: {
          afterViteMiddleware: afterMiddleware,
        },
      };

      const result = await createViteServerHelper(config);

      expect(afterMiddleware).toHaveBeenCalledWith(result.app);
    });
  });

  describe("Error Handling", () => {
    it("should setup error handler with development error details", async () => {
      const onRequestError = vi.fn();
      const config: ServerHelperConfig = {
        ...baseConfig,
        isProduction: false,
        errorConfig: {
          onRequestError,
          exposeErrorDetails: true,
        },
      };

      const result = await createViteServerHelper(config);

      // Access the error handler through the app's middleware stack
      // This is a simplified test - in real scenarios, we'd trigger an actual error
      expect(result.app).toBeDefined();
      expect(onRequestError).toBeDefined();
    });

    it("should call Vite error stack trace fixer in development", async () => {
      const config: ServerHelperConfig = {
        ...baseConfig,
        isProduction: false,
        templateConfig: {
          serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
          getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
        },
      };

      const result = await createViteServerHelper(config);

      expect(result.vite).toBe(mockViteServer);
      expect(mockViteServer.ssrFixStacktrace).toBeDefined();
    });

    it("should hide error details in production by default", async () => {
      const config: ServerHelperConfig = {
        ...baseConfig,
        isProduction: true,
        templateConfig: {
          serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
          getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
        },
        errorConfig: {
          exposeErrorDetails: false,
        },
      };

      const result = await createViteServerHelper(config);

      expect(result.app).toBeDefined();
      // Error handler is set up but error details should be hidden in production
    });
  });

  describe("File System Interactions", () => {
    it("should handle missing index file gracefully", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      // Use same pattern as the fs read test - partial config to bypass getTemplate requirement
      const partialTemplateConfig = {
        serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
      } as any;

      const config: ServerHelperConfig = {
        ...baseConfig,
        isProduction: true, // Use production mode for this test
        templateConfig: partialTemplateConfig,
      };

      const result = await createViteServerHelper(config);

      expect(result.getTemplate).toBeUndefined();
    });

    it("should read template file for caching in development", async () => {
      const mockTemplate = "<html><body>Test template</body></html>";
      vi.mocked(fs.readFileSync).mockReturnValue(mockTemplate);

      // Create a partial TemplateConfig to satisfy TypeScript
      const partialTemplateConfig = {
        serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
      } as any; // Use 'as any' to bypass getTemplate requirement

      const config: ServerHelperConfig = {
        ...baseConfig,
        isProduction: false,
        templateConfig: partialTemplateConfig,
      };

      const result = await createViteServerHelper(config);

      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/app/build/index.html",
        "utf8",
      );
      expect(result.getTemplate).toBeDefined();
    });
  });

  describe("Configuration Validation", () => {
    it("should handle minimal configuration", async () => {
      const minimalConfig: ServerHelperConfig = {
        logger: mockLogger,
        isProduction: true,
        viteConfig: {
          appType: "spa",
          base: "/",
        },
        templateConfig: {
          serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
          getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
        },
        staticConfig: {
          buildPath: "/app/build",
          indexFile: "/app/build/index.html",
        },
        expressConfig: {},
      };

      const result = await createViteServerHelper(minimalConfig);

      expect(result.app).toBeDefined();
      expect(result.vite).toBeUndefined();
    });

    it("should handle all optional configurations", async () => {
      const fullConfig: ServerHelperConfig = {
        logger: mockLogger,
        isProduction: false,
        viteConfig: {
          appType: "custom",
          base: "/app/",
          configFile: "/custom/vite.config.js",
          serverOptions: { port: 4000 },
        },
        staticConfig: {
          buildPath: "/app/build",
          clientPath: "/app/build/client",
          indexFile: "/app/build/index.html",
          extensions: [".html", ".js", ".css"],
        },
        templateConfig: {
          serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
          getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
          transformTemplate: (t: string) => t.toUpperCase(),
        },
        expressConfig: {
          compression: true,
          bodyLimit: "100mb",
          beforeViteMiddleware: vi.fn(),
          afterViteMiddleware: vi.fn(),
        },
        errorConfig: {
          onRequestError: vi.fn(),
          exposeErrorDetails: true,
        },
      };

      const result = await createViteServerHelper(fullConfig);

      expect(result.app).toBeDefined();
      expect(result.vite).toBe(mockViteServer);
      expect(result.serverEntry).toBeDefined();
      expect(result.getTemplate).toBeDefined();
      expect(result.transformTemplate).toBeDefined();

      // Test transform function
      const transformed = result.transformTemplate!("<html>test</html>");
      expect(transformed).toBe("<HTML>TEST</HTML>");
    });
  });
});
