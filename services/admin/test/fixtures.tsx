/**
 * Shared vitest fixtures for admin spec tests.
 *
 * Provides a `test.extend` fixture that wraps components in real react-admin
 * context (`AdminContext` + `RecordContextProvider`) instead of mocking every
 * hook individually.  HTTP calls from sub-components are intercepted via MSW.
 *
 * Usage:
 *
 *   import { test } from "../../../test/fixtures.js";
 *
 *   test("my test", async ({ renderWithContext }) => {
 *     const { getByRole } = renderWithContext(<MyEdit />, { record, permissions: [] });
 *     expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
 *   });
 */

import * as React from "react";
import {
  AdminContext,
  RecordContextProvider,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import { render } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { test as baseTest, afterAll, afterEach, beforeAll } from "vitest";

// ---------------------------------------------------------------------------
// Minimal dataProvider stub — returns empty lists / no-ops for mutations
// ---------------------------------------------------------------------------

const emptyList = { data: [], total: 0 };
const emptyRecord = { data: { id: "unknown" } };

export const minimalDataProvider = {
  getList: async () => emptyList,
  getOne: async (_resource: string, { id }: { id: string }) => ({
    data: { id },
  }),
  getMany: async () => emptyList,
  getManyReference: async () => emptyList,
  create: async (_resource: string, { data }: { data: unknown }) =>
    emptyRecord,
  update: async (_resource: string, { data }: { data: unknown }) =>
    emptyRecord,
  updateMany: async () => ({ data: [] }),
  delete: async () => emptyRecord,
  deleteMany: async () => ({ data: [] }),
};

// ---------------------------------------------------------------------------
// Minimal authProvider — controlled by `permissions` array
// ---------------------------------------------------------------------------

export const makeAuthProvider = (permissions: string[] = []) => ({
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkAuth: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
  getPermissions: () => Promise.resolve(permissions),
  getIdentity: () =>
    Promise.resolve({ id: "user-test-id", fullName: "Test User" }),
});

// ---------------------------------------------------------------------------
// MSW server — intercepts any HTTP calls from deeply-nested sub-components
// ---------------------------------------------------------------------------

export const mswServer = setupServer(
  // Catch-all handler: return empty 200 for any request not otherwise handled
  http.get("*", () => HttpResponse.json({ data: [], total: 0 })),
  http.post("*", () => HttpResponse.json({ data: {} })),
);

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});

// ---------------------------------------------------------------------------
// renderWithAdminContext helper
// ---------------------------------------------------------------------------

export interface RenderOptions {
  record?: Record<string, unknown>;
  permissions?: string[];
  resource?: string;
}

export function renderWithAdminContext(
  ui: React.ReactElement,
  { record, permissions = [], resource = "links" }: RenderOptions = {},
): RenderResult {
  const authProvider = makeAuthProvider(permissions);

  const wrapped = (
    <AdminContext
      dataProvider={minimalDataProvider as any}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
    >
      {record ? (
        <RecordContextProvider value={record}>{ui}</RecordContextProvider>
      ) : (
        ui
      )}
    </AdminContext>
  );

  return render(wrapped);
}

// ---------------------------------------------------------------------------
// test.extend fixtures
// ---------------------------------------------------------------------------

interface AdminFixtures {
  /**
   * Render a component inside AdminContext + RecordContextProvider.
   * Permissions default to `[]` (non-admin).
   */
  renderWithContext: (
    ui: React.ReactElement,
    options?: RenderOptions,
  ) => RenderResult;
}

export const test = baseTest.extend<AdminFixtures>({
  renderWithContext: async ({}, use) => {
    await use(renderWithAdminContext);
  },
});

export { expect } from "vitest";
