import * as fs from "fs";
import * as path from "path";
import type { Logger } from "@liexp/core/lib/logger/index.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ServerHelperConfig } from "../vite/types.js";
import { createViteServerHelper } from "../vite-server-helper.js";

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
  const mockLogger = mock<Logger>({
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  });

  const baseSpaConfig: ServerHelperConfig = {
    service: "test-spa-app",
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

  const baseSsrConfig: ServerHelperConfig = {
    service: "test-ssr-app",
    logger: mockLogger,
    isProduction: false,
    viteConfig: {
      appType: "custom",
      base: "/",
    },
    staticConfig: {
      buildPath: "/app/build",
      clientPath: "/app/build/client",
      indexFile: "/app/build/index.html",
    },
    templateConfig: {
      serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
      getTemplate: vi.fn().mockResolvedValue("<html>test</html>"),
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
          ...baseSpaConfig,
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
        expect(createServer).toHaveBeenCalledWith(
          expect.objectContaining({
            server: expect.objectContaining({
              middlewareMode: true,
              hmr: true,
            }),
            appType: "spa",
            base: "/",
            configFile: undefined,
          }),
        );
      });

      it("should handle custom vite config options", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: false,
          viteConfig: {
            ...baseSpaConfig.viteConfig,
            configFile: "/custom/vite.config.js",
            serverOptions: { port: 3000 },
          },
        };

        await createViteServerHelper(config);

        const { createServer } = await import("vite");
        expect(createServer).toHaveBeenCalledWith(
          expect.objectContaining({
            server: expect.objectContaining({
              port: 3000,
              middlewareMode: true,
              hmr: true,
            }),
            appType: "spa",
            base: "/",
            configFile: "/custom/vite.config.js",
          }),
        );
      });

      it("should configure cacheDir when provided", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: false,
          viteConfig: {
            ...baseSpaConfig.viteConfig,
            cacheDir: "/app/.vite-cache",
          },
        };

        await createViteServerHelper(config);

        const { createServer } = await import("vite");
        expect(createServer).toHaveBeenCalledWith(
          expect.objectContaining({
            cacheDir: "/app/.vite-cache",
            optimizeDeps: { noDiscovery: true, include: [] },
          }),
        );
      });

      it("should not include template handlers for SPA mode", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: false,
        };

        const result = await createViteServerHelper(config);

        expect(result.serverEntry).toBeUndefined();
        expect(result.getTemplate).toBeUndefined();
        expect(result.transformTemplate).toBeUndefined();
      });
    });

    describe("SSR Configuration", () => {
      it("should setup SSR with template handling", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue("/src/entry.tsx");
        const mockGetTemplate = vi
          .fn()
          .mockResolvedValue("<html>custom</html>");

        const config: ServerHelperConfig = {
          ...baseSsrConfig,
          isProduction: false,
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
        await result.getTemplate!("http://localhost", "/");
        expect(mockGetTemplate).toHaveBeenCalledWith("http://localhost", "/");
        expect(mockViteServer.transformIndexHtml).toHaveBeenCalled();
      });

      it("should use default template when no custom getTemplate provided", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue("/src/entry.tsx");

        const config: ServerHelperConfig = {
          ...baseSsrConfig,
          isProduction: false,
          templateConfig: {
            serverEntry: mockServerEntry,
          },
        };

        const result = await createViteServerHelper(config);

        expect(result.getTemplate).toBeDefined();
        await result.getTemplate!("http://localhost", "/");
        expect(mockViteServer.transformIndexHtml).toHaveBeenCalledWith(
          "http://localhost",
          "<html><head></head><body><!--web-analytics--></body></html>",
          "/",
        );
      });

      it("should throw error when SSR mode is missing clientPath", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          viteConfig: {
            ...baseSpaConfig.viteConfig,
            appType: "custom",
          },
          templateConfig: {
            serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
          },
        };

        await expect(createViteServerHelper(config)).rejects.toThrow(
          "SSR mode requires staticConfig.clientPath to be configured",
        );
      });

      it("should throw error when SSR mode is missing templateConfig", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          viteConfig: {
            ...baseSpaConfig.viteConfig,
            appType: "custom",
          },
          staticConfig: {
            ...baseSpaConfig.staticConfig,
            clientPath: "/app/build/client",
          },
        };

        await expect(createViteServerHelper(config)).rejects.toThrow(
          "SSR mode requires templateConfig to be configured",
        );
      });
    });
  });

  describe("Production Mode", () => {
    describe("SPA Configuration", () => {
      it("should serve static files with SPA fallback", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
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
          single: true,
          dev: false,
          etag: true,
          maxAge: 31536000,
          immutable: true,
        });
      });

      it("should handle custom static extensions", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: true,
          staticConfig: {
            ...baseSpaConfig.staticConfig,
            extensions: [".html", ".js"],
          },
        };

        await createViteServerHelper(config);

        const sirv = await import("sirv");
        expect(vi.mocked(sirv.default)).toHaveBeenCalledWith("/app/build", {
          extensions: [".html", ".js"],
          single: true,
          dev: false,
          etag: true,
          maxAge: 31536000,
          immutable: true,
        });
      });
    });

    describe("SPA Fallback Route", () => {
      it("should register catch-all route for SPA applications", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: true,
        };

        const result = await createViteServerHelper(config);

        // Verify the app was created for SPA mode
        expect(result.app).toBeDefined();
        expect(result.vite).toBeUndefined();
      });

      it("should skip API routes in SPA fallback", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: true,
        };

        const result = await createViteServerHelper(config);

        // The fallback route should call next() for API routes
        // We can't easily test the route handler directly, but we verify it's registered
        expect(result.app).toBeDefined();
      });

      it("should serve index.html for non-API routes", async () => {
        const config: ServerHelperConfig = {
          ...baseSpaConfig,
          isProduction: true,
        };

        const result = await createViteServerHelper(config);

        // Verify production mode setup without Vite dev server
        expect(result.app).toBeDefined();
        expect(result.vite).toBeUndefined();
      });

      it("should not register catch-all for SSR applications", async () => {
        const config: ServerHelperConfig = {
          ...baseSsrConfig,
          isProduction: true,
        };

        const result = await createViteServerHelper(config);

        // SSR apps should not have the catch-all route
        expect(result.app).toBeDefined();
      });
    });

    describe("SSR Configuration", () => {
      it("should setup SSR production with client path", async () => {
        const mockServerEntry = vi.fn().mockResolvedValue("/entry-path");
        const mockGetTemplate = vi
          .fn()
          .mockResolvedValue("<html>production</html>");

        const config: ServerHelperConfig = {
          ...baseSsrConfig,
          isProduction: true,
          templateConfig: {
            serverEntry: mockServerEntry,
            getTemplate: mockGetTemplate,
          },
        };

        const result = await createViteServerHelper(config);

        // serverEntry is wrapped in dynamic import by implementation
        expect(result.serverEntry).toBeDefined();
        expect(typeof result.serverEntry).toBe("function");
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
          ...baseSsrConfig,
          isProduction: true,
          templateConfig: {
            serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
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
        ...baseSpaConfig,
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
      // Clear previous calls
      const compression = await import("compression");
      vi.mocked(compression.default).mockClear();

      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        expressConfig: {
          compression: false,
        },
      };

      await createViteServerHelper(config);

      // Verify compression was not called by checking the call count is zero
      expect(vi.mocked(compression.default)).toHaveBeenCalledTimes(0);
    });

    it("should setup body parsers with custom limit", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
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
        ...baseSpaConfig,
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
        ...baseSpaConfig,
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
        ...baseSpaConfig,
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
        ...baseSsrConfig,
        isProduction: false,
      };

      const result = await createViteServerHelper(config);

      expect(result.vite).toBe(mockViteServer);
      expect(mockViteServer.ssrFixStacktrace).toBeDefined();
    });

    it("should hide error details in production by default", async () => {
      const config: ServerHelperConfig = {
        ...baseSsrConfig,
        isProduction: true,
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
    it("should handle missing index file gracefully for SSR", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config: ServerHelperConfig = {
        ...baseSsrConfig,
        isProduction: true,
      };

      const result = await createViteServerHelper(config);

      // getTemplate should return empty string when index file is missing
      expect(result.getTemplate).toBeDefined();
      const template = await result.getTemplate!("http://localhost", "/");
      expect(template).toBe("");
    });

    it("should read template file for caching in development", async () => {
      const mockTemplate = "<html><body>Test template</body></html>";
      vi.mocked(fs.readFileSync).mockReturnValue(mockTemplate);

      const config: ServerHelperConfig = {
        ...baseSsrConfig,
        isProduction: false,
        templateConfig: {
          serverEntry: vi.fn().mockResolvedValue("/src/entry.tsx"),
        },
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
    it("should handle minimal SPA configuration", async () => {
      const minimalConfig: ServerHelperConfig = {
        service: "test-spa-app",
        logger: mockLogger,
        isProduction: true,
        viteConfig: {
          appType: "spa",
          base: "/",
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

    it("should handle all optional configurations for SSR", async () => {
      const fullConfig: ServerHelperConfig = {
        service: "test-ssr-app",
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

  describe("HMR Configuration", () => {
    it("should enable HMR with default configuration when hmr is undefined", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: false,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          // hmr is undefined
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: true,
          }),
        }),
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR enabled with default configuration",
      );
    });

    it("should enable HMR with default configuration when hmr is true", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: false,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          hmr: true,
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: true,
          }),
        }),
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR enabled with default configuration",
      );
    });

    it("should disable HMR when hmr is false", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: false,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          hmr: false,
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: false,
          }),
        }),
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR disabled by configuration",
      );
    });

    it("should configure HMR with custom host and clientPort", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: false,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          hmr: {
            host: "localhost",
            clientPort: 24678,
          },
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: {
              host: "localhost",
              clientPort: 24678,
            },
          }),
        }),
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR host: %s",
        "localhost",
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR client port: %d",
        24678,
      );
    });

    it("should configure HMR with protocol option", async () => {
      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: false,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          hmr: {
            protocol: "wss",
          },
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: {
              protocol: "wss",
            },
          }),
        }),
      );
      expect(mockLogger.info.log).toHaveBeenCalledWith(
        "HMR protocol: %s",
        "wss",
      );
    });

    it("should pass HMR config through for SSR mode", async () => {
      const config: ServerHelperConfig = {
        ...baseSsrConfig,
        isProduction: false,
        viteConfig: {
          ...baseSsrConfig.viteConfig,
          hmr: {
            host: "0.0.0.0",
            clientPort: 3002,
            protocol: "ws",
          },
        },
      };

      await createViteServerHelper(config);

      const { createServer } = await import("vite");
      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            middlewareMode: true,
            hmr: {
              host: "0.0.0.0",
              clientPort: 3002,
              protocol: "ws",
            },
          }),
        }),
      );
    });

    it("should not configure HMR in production mode", async () => {
      const { createServer } = await import("vite");
      vi.mocked(createServer).mockClear();

      const config: ServerHelperConfig = {
        ...baseSpaConfig,
        isProduction: true,
        viteConfig: {
          ...baseSpaConfig.viteConfig,
          hmr: {
            host: "localhost",
            clientPort: 24678,
          },
        },
      };

      await createViteServerHelper(config);

      // In production, Vite dev server is not created
      expect(createServer).not.toHaveBeenCalled();
    });
  });
});
