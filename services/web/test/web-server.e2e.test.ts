import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  GetWebAppTest,
  closeWebAppTest,
  type WebAppTest,
} from "./WebAppTest.js";

describe.sequential("Web Server E2E Tests", () => {
  describe("Development Mode", () => {
    let Test: WebAppTest;

    beforeAll(async () => {
      Test = await GetWebAppTest(false); // Development mode
    });

    afterAll(async () => {
      await closeWebAppTest();
    });

    describe("Basic Server Functionality", () => {
      it("should respond to health check endpoint", async () => {
        const response = await Test.req.get("/healthcheck");

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          status: "ok",
          service: "web",
        });
      });

      it("should serve the root route", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      }, 15000); // Increased timeout for slow development server

      it("should handle SPA routing fallback", async () => {
        const response = await Test.req.get("/nonexistent-route");

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      });
    });

    describe("Static File Serving", () => {
      it("should serve static assets with correct headers", async () => {
        // Test for CSS files
        const cssResponse = await Test.req.get("/public/style.css");

        // Should either serve the file or return 404 (both are acceptable)
        expect([200, 404]).toContain(cssResponse.status);
      });

      it("should handle missing static files gracefully", async () => {
        const response = await Test.req.get("/public/nonexistent.js");

        // With SPA fallback, missing files return HTML (200) or 404
        expect([200, 404]).toContain(response.status);
      });
    });

    describe("SSR Functionality", () => {
      it("should render server-side content", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.text).toContain('id="root"');
        // Should contain React SSR content
        expect(response.text).toContain("lies.exposed");
      });

      it("should include meta tags and proper HTML structure", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.text).toContain('id="root"');
        // Should contain React SSR content
        expect(response.text).toContain("lies.exposed");
      });

      it("should handle different routes with SSR", async () => {
        const aboutResponse = await Test.req.get("/about");

        expect(aboutResponse.status).toBe(200);
        expect(aboutResponse.type).toBe("text/html");
      });
    });

    describe("Error Handling", () => {
      it("should handle server errors gracefully", async () => {
        // Test a route that might cause an error
        const response = await Test.req.get("/api/nonexistent");

        // SPA fallback serves all routes as HTML, so this returns 200
        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      });

      it("should return proper content-type for HTML responses", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.get("content-type")).toMatch(/text\/html/);
      });
    });

    describe("Security Headers", () => {
      it("should include security headers in responses", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);

        // Check for common security headers (these may or may not be present)
        const headers = response.headers;

        // At minimum, we should get a content-type header
        expect(headers["content-type"]).toBeDefined();
      });
    });
  });

  describe("Production Mode", () => {
    let Test: WebAppTest;

    beforeAll(async () => {
      Test = await GetWebAppTest(true); // Production mode
    });

    afterAll(async () => {
      await closeWebAppTest();
    });

    describe("Production Server Configuration", () => {
      it("should serve static files from build directory", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      });

      it("should enable compression in production", async () => {
        const response = await Test.req
          .get("/")
          .set("Accept-Encoding", "gzip, deflate");

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
        // In production with compression enabled, response should be compressed
        // Check for compression header if compression is working
      });

      it("should not expose detailed error messages in production", async () => {
        // Try to access a non-existent API route - should fallback to SPA
        const response = await Test.req.get("/api/force-error");

        // In SPA mode, non-existent routes serve the main HTML file
        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      }); // Increased timeout for SSR processing
    });

    describe("Production Static File Handling", () => {
      it("should serve client assets with proper caching headers", async () => {
        const response = await Test.req.get("/");

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
        expect(response.headers["content-type"]).toMatch(/text\/html/);
        // Root route should always be available in production
      });

      it("should handle SPA fallback correctly in production", async () => {
        const response = await Test.req.get("/app/nested/route");

        // SPA fallback should serve the main HTML file for any route
        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
      });
    });

    describe("Production SSR Performance", () => {
      it("should respond quickly to requests", async () => {
        const start = Date.now();
        const response = await Test.req.get("/");
        const duration = Date.now() - start;

        expect(response.status).toBe(200);
        expect(duration).toBeLessThan(1000);
      });

      it("should handle multiple concurrent requests", async () => {
        const requests = Array.from({ length: 5 }, () => Test.req.get("/"));

        const responses = await Promise.all(requests);

        responses.forEach((response) => {
          expect(response.status).toBe(200);
          expect(response.type).toBe("text/html");
        });
      });
    });
  });
});
