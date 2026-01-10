import { fc } from "@liexp/test/lib/index.js";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { GetAdminAppTest, closeAdminAppTest } from "./AdminAppTest.js";
import type { AdminAppTest } from "./AdminAppTest.js";

/**
 * Generate sample UUIDs for each resource type.
 * All resources use UUID as their ID format.
 */
const generateResourceIds = () => {
  // Generate all UUIDs at once for consistency
  const uuids = fc.sample(fc.uuid(), 25);
  return {
    pages: uuids[0],
    stories: uuids[1],
    media: uuids[2],
    links: uuids[3],
    actors: uuids[4],
    groups: uuids[5],
    "groups-members": uuids[6],
    areas: uuids[7],
    graphs: uuids[8],
    events: uuids[9],
    "events/suggestions": uuids[10],
    books: uuids[11],
    deaths: uuids[12],
    "scientific-studies": uuids[13],
    patents: uuids[14],
    documentaries: uuids[15],
    quotes: uuids[16],
    transactions: uuids[17],
    keywords: uuids[18],
    "social-posts": uuids[19],
    users: uuids[20],
    settings: uuids[21],
    nations: uuids[22],
    queues: uuids[23],
  };
};

/**
 * All admin resource routes to test.
 * Each route should serve the SPA index.html without errors.
 */
const ADMIN_RESOURCE_ROUTES = [
  // Core resources
  { name: "pages", path: "/pages" },
  { name: "stories", path: "/stories" },
  { name: "media", path: "/media" },
  { name: "media-multiple", path: "/media/multiple" },
  { name: "links", path: "/links" },
  { name: "actors", path: "/actors" },
  { name: "groups", path: "/groups" },
  { name: "groups-members", path: "/groups-members" },
  { name: "areas", path: "/areas" },
  { name: "graphs", path: "/graphs" },

  // Event resources
  { name: "events", path: "/events" },
  { name: "events-suggestions", path: "/events/suggestions" },
  { name: "books", path: "/books" },
  { name: "deaths", path: "/deaths" },
  { name: "scientific-studies", path: "/scientific-studies" },
  { name: "patents", path: "/patents" },
  { name: "documentaries", path: "/documentaries" },
  { name: "quotes", path: "/quotes" },
  { name: "transactions", path: "/transactions" },

  // Other resources
  { name: "keywords", path: "/keywords" },
  { name: "social-posts", path: "/social-posts" },
  { name: "users", path: "/users" },
  { name: "settings", path: "/settings" },
  { name: "nations", path: "/nations" },
  { name: "queues", path: "/queues" },
] as const;

/**
 * Create routes for list, create, and edit pages
 */
const ADMIN_CREATE_ROUTES = ADMIN_RESOURCE_ROUTES.filter(
  (r) => !r.path.includes("/multiple"),
).map((r) => ({
  name: `${r.name}-create`,
  path: `${r.path}/create`,
}));

/**
 * Patterns that indicate an error in the HTML response
 */
const ERROR_PATTERNS = [
  /Internal Server Error/i,
  /500 Error/i,
  /Something went wrong/i,
  /Application Error/i,
  /Cannot read propert/i,
  /is not defined/i,
  /Uncaught.*Error/i,
];

/**
 * Check if HTML contains any error patterns
 */
function containsErrorPattern(html: string): string | null {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(html)) {
      const match = html.match(pattern);
      return match ? match[0] : "Unknown error pattern";
    }
  }
  return null;
}

describe.sequential("Admin Page Routes", () => {
  let AdminTest: AdminAppTest;

  beforeAll(async () => {
    AdminTest = await GetAdminAppTest(false);
  });

  afterAll(async () => {
    await closeAdminAppTest();
  });

  describe("Resource List Pages", () => {
    for (const route of ADMIN_RESOURCE_ROUTES) {
      it(`should serve ${route.name} list page at ${route.path}`, async () => {
        const response = await AdminTest.req.get(route.path);

        // Should return 200 OK
        expect(response.status).toBe(200);

        // Should be HTML
        expect(response.type).toBe("text/html");

        // Should contain the admin title
        expect(response.text).toContain("<title>Admin - lies.exposed</title>");

        // Should not contain error patterns
        const errorFound = containsErrorPattern(response.text);
        if (errorFound) {
          throw new Error(
            `Error pattern found in ${route.path}: ${errorFound}`,
          );
        }
      });
    }
  });

  describe("Resource Create Pages", () => {
    for (const route of ADMIN_CREATE_ROUTES) {
      it(`should serve ${route.name} page at ${route.path}`, async () => {
        const response = await AdminTest.req.get(route.path);

        // Should return 200 OK
        expect(response.status).toBe(200);

        // Should be HTML
        expect(response.type).toBe("text/html");

        // Should contain the admin title
        expect(response.text).toContain("<title>Admin - lies.exposed</title>");

        // Should not contain error patterns
        const errorFound = containsErrorPattern(response.text);
        if (errorFound) {
          throw new Error(
            `Error pattern found in ${route.path}: ${errorFound}`,
          );
        }
      });
    }
  });

  describe("Resource Show/Edit Pages", () => {
    // Generate IDs using arbitraries for each resource type
    const resourceIds = generateResourceIds();

    // Resources that have show/edit pages
    const SHOW_PAGE_ROUTES = ADMIN_RESOURCE_ROUTES.filter(
      (r) => !r.path.includes("/multiple"),
    );

    for (const route of SHOW_PAGE_ROUTES) {
      it(`should serve ${route.name} show page at ${route.path}/:id`, async () => {
        // Get the resource-specific ID from arbitraries
        const resourceKey = route.name as keyof typeof resourceIds;
        const resourceId = resourceIds[resourceKey];

        const showPath = `${route.path}/${resourceId}`;
        const response = await AdminTest.req.get(showPath);

        // Should return 200 OK (SPA will handle showing 404 for non-existent resources)
        expect(response.status).toBe(200);

        // Should be HTML
        expect(response.type).toBe("text/html");

        // Should contain the admin title
        expect(response.text).toContain("<title>Admin - lies.exposed</title>");

        // Should not contain server-side error patterns
        const errorFound = containsErrorPattern(response.text);
        if (errorFound) {
          throw new Error(
            `Error pattern found in ${showPath}: ${errorFound}`,
          );
        }
      });

      it(`should serve ${route.name} show page with "show" suffix at ${route.path}/:id/show`, async () => {
        const resourceKey = route.name as keyof typeof resourceIds;
        const resourceId = resourceIds[resourceKey];

        const showPath = `${route.path}/${resourceId}/show`;
        const response = await AdminTest.req.get(showPath);

        expect(response.status).toBe(200);
        expect(response.type).toBe("text/html");
        expect(response.text).toContain("<title>Admin - lies.exposed</title>");

        const errorFound = containsErrorPattern(response.text);
        if (errorFound) {
          throw new Error(
            `Error pattern found in ${showPath}: ${errorFound}`,
          );
        }
      });
    }
  });

  describe("Custom Routes", () => {
    it("should serve the dashboard at /", async () => {
      const response = await AdminTest.req.get("/");

      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("<title>Admin - lies.exposed</title>");

      const errorFound = containsErrorPattern(response.text);
      expect(errorFound).toBeNull();
    });

    it("should serve the login page at /login", async () => {
      const response = await AdminTest.req.get("/login");

      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("<title>Admin - lies.exposed</title>");

      const errorFound = containsErrorPattern(response.text);
      expect(errorFound).toBeNull();
    });

    it("should serve queue edit page with nested params", async () => {
      // Generate a proper UUID for the queue resource
      const groupId = fc.sample(fc.uuid(), 1)[0];
      const response = await AdminTest.req.get(
        `/queues/openai_summarize/groups/${groupId}`,
      );

      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("<title>Admin - lies.exposed</title>");

      const errorFound = containsErrorPattern(response.text);
      expect(errorFound).toBeNull();
    });
  });

  describe("404 Handling", () => {
    it("should serve the SPA for unknown routes (client-side 404)", async () => {
      const response = await AdminTest.req.get("/unknown/route/that/does/not/exist");

      // SPA serves index.html for all routes, client handles 404
      expect(response.status).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("<title>Admin - lies.exposed</title>");

      // Should not have server-side errors
      const errorFound = containsErrorPattern(response.text);
      expect(errorFound).toBeNull();
    });
  });

  describe("HTML Structure Validation", () => {
    it("should have valid HTML structure for all pages", async () => {
      // Test a sample of pages for valid HTML structure
      const sampleRoutes = ["/", "/actors", "/events", "/users"];

      for (const path of sampleRoutes) {
        const response = await AdminTest.req.get(path);

        expect(response.status).toBe(200);

        // Should have DOCTYPE
        expect(response.text).toMatch(/<!DOCTYPE html>/i);

        // Should have html tag
        expect(response.text).toMatch(/<html[^>]*>/i);

        // Should have head tag
        expect(response.text).toMatch(/<head[^>]*>/i);

        // Should have body tag
        expect(response.text).toMatch(/<body[^>]*>/i);

        // Should have root div for React
        expect(response.text).toContain('id="root"');

        // Should have closing tags
        expect(response.text).toMatch(/<\/html>/i);
        expect(response.text).toMatch(/<\/body>/i);
      }
    });
  });
});
