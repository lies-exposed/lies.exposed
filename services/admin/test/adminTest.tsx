/**
 * Canonical vitest fixtures for admin spec tests.
 *
 * Provides a `test.extend` fixture (`adminTest`) that wraps components in real
 * react-admin context (`AdminContext` + `RecordContextProvider` +
 * `ResourceContext.Provider`) instead of mocking every hook individually.
 * HTTP calls from sub-components are intercepted via MSW.
 *
 * Usage:
 *
 *   import { adminTest, expect } from "../../../test/adminTest.js";
 *
 *   adminTest("my test", async ({ render }) => {
 *     const { getByRole } = render(<MyEdit />, { record, permissions: ["admin:read"] });
 *     expect(getByRole("button", { name: "Save" })).toBeInTheDocument();
 *   });
 */

import {
  AdminContext,
  type AuthProvider,
  type DataProvider,
  RecordContextProvider,
  ResourceContext,
  reactRouterProvider,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render as tlRender } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import * as React from "react";
import { MemoryRouter } from "react-router";
import { test as baseTest, afterAll, afterEach, beforeAll, vi } from "vitest";
import {
  mock,
  mockClear,
  mockDeep,
  type MockProxy,
} from "vitest-mock-extended";

// ---------------------------------------------------------------------------
// MSW server — intercepts any HTTP calls from deeply-nested sub-components
// ---------------------------------------------------------------------------

const mswServer = setupServer(
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
interface AdminMocks {
  authProvider: MockProxy<Required<AuthProvider>>;
  dataProvider: MockProxy<DataProvider>;
  queryClient: QueryClient;
}

interface RenderOptions {
  record?: Record<string, unknown>;
  permissions?: string[];
  resource?: string;
  /** Override the route :id param. Defaults to record.id or "test-id". */
  id?: string;
}

// No-op Route/Routes replacements for use in tests.
// TabbedFormView calls Routes from the routerProvider when syncWithLocation=true.
// These no-op components render their children/element directly without calling
// useRoutes(), avoiding the "must be inside a <Router>" invariant.
const TestRoutes: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);
const TestRoute: React.FC<{
  path?: string;
  element?: React.ReactNode;
  children?: React.ReactNode;
  index?: boolean;
}> = ({ element, children }) => (
  <>{element ?? children ?? "No component given"}</>
);

// No-op Link replacement — FormTabHeader renders tabs as <LinkBase> which calls
// provider.Link (react-router-dom's Link). That Link component needs router context
// from its own ESM module instance, which differs from our MemoryRouter's CJS
// context — causing a crash. We override with a plain <a> that needs no router.
const TestLink = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string | object }
>(({ to, children, ...props }, ref) => {
  const href = typeof to === "string" ? to : ((to as any)?.pathname ?? "#");
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  );
});
TestLink.displayName = "TestLink";

/**
 * Build a custom routerProvider for AdminContext that:
 * - Skips internal router creation entirely (RouterWrapper = Fragment)
 * - Injects the test record id into useParams() so that useEditController works
 * - Returns minimal stubs for useNavigate/useLocation/useInRouterContext
 * - Replaces Routes/Route with no-ops to avoid useRoutes() invariant inside TabbedFormView
 *
 * The outer MemoryRouter still handles direct react-router calls (useNavigate,
 * useLocation) from components that import them directly from react-router.
 */
const makeTestRouterProvider = (routeId: string) => ({
  ...reactRouterProvider,
  // Always act as if we're inside a router — skip InternalRouter creation
  useInRouterContext: () => true,
  // RouterWrapper just renders children without any router wrapping
  RouterWrapper: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  // Provide the record id that useEditController looks for
  useParams: () => ({ id: routeId }) as any,
  // Minimal navigate stub — components that call navigate() won't crash
  useNavigate: () => () => undefined,
  // Minimal location stub
  useLocation: () => ({
    pathname: `/${routeId}`,
    search: "",
    hash: "",
    state: null,
    key: "test",
  }),
  // No-op Routes/Route so TabbedFormView doesn't require a real Router context
  Routes: TestRoutes as typeof reactRouterProvider.Routes,
  Route: TestRoute as typeof reactRouterProvider.Route,
  // No-op Link so FormTabHeader tabs don't need a real react-router context
  Link: TestLink as typeof reactRouterProvider.Link,
});

const renderWithAdminContext =
  (mocks: AdminMocks) =>
  async (
    ui: React.ReactElement,
    options: RenderOptions = {},
  ): Promise<RenderResult> => {
    const { record, permissions, resource = "links", id } = options;
    // Resolve the route id: explicit prop → record.id → fallback
    const routeId = id ?? (record?.id as string | undefined) ?? "test-id";

    // Only override getPermissions if the caller explicitly passed a permissions
    // array — otherwise leave whatever the test or fixture already configured.
    if ("permissions" in options) {
      mocks.authProvider.getPermissions?.mockResolvedValue(permissions as any);
    }

    // Configure dataProvider.getOne to return the provided record (or a stub
    // matching routeId) so useEditController doesn't throw an id mismatch.
    mocks.dataProvider.getOne.mockResolvedValue({
      data: record ? { ...record, id: routeId } : { id: routeId },
    } as any);

    const routerProvider = makeTestRouterProvider(routeId);

    // Wrap with MemoryRouter so that any components calling useNavigate() or
    // useRoutes() directly from react-router find a real router context.
    // The custom routerProvider above intercepts AdminContext's own routing
    // (preventing AdminRouter from creating an InternalRouter) and provides the
    // test id via useParams(), while MemoryRouter handles the rest.
    let result!: RenderResult;
    act(() => {
      result = tlRender(
        // Outer QueryClientProvider makes the same QueryClient available to any
        // component that calls useQueryClient() outside or inside AdminContext
        // (AdminContext re-uses our client via its queryClient prop).
        <QueryClientProvider client={mocks.queryClient}>
          <MemoryRouter initialEntries={[`/${routeId}`]}>
            <AdminContext
              dataProvider={mocks.dataProvider}
              authProvider={mocks.authProvider}
              i18nProvider={i18nProvider}
              routerProvider={routerProvider}
              queryClient={mocks.queryClient}
            >
              <ResourceContext.Provider value={resource}>
                {record ? (
                  <RecordContextProvider value={record}>
                    {ui}
                  </RecordContextProvider>
                ) : (
                  ui
                )}
              </ResourceContext.Provider>
            </AdminContext>
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });

    return Promise.resolve(result);
  };

// ---------------------------------------------------------------------------
// test.extend fixtures
// ---------------------------------------------------------------------------

interface AdminFixtures {
  /**
   * Render a component inside AdminContext + ResourceContext.Provider +
   * RecordContextProvider.  Permissions default to `[]` (non-admin).
   * Returns a standard @testing-library/react RenderResult.
   * The render is wrapped in `act()` so initial state updates are flushed.
   */
  render: (
    ui: React.ReactElement,
    options?: RenderOptions,
  ) => Promise<RenderResult>;

  mocks: AdminMocks;
}

export const adminTest = baseTest.extend<AdminFixtures>({
  mocks: async ({}, use) => {
    const authProvider = mockDeep<Required<AuthProvider>>({
      getPermissions: vi.fn(),
    });
    // Set sensible defaults so react-admin's internal queries don't receive
    // undefined (which react-query rejects as invalid query data).
    authProvider.checkAuth.mockResolvedValue(undefined);
    authProvider.checkError.mockResolvedValue(undefined);
    authProvider.getPermissions.mockResolvedValue([]);
    authProvider.getIdentity.mockResolvedValue({
      id: "user-test-id",
      fullName: "Test User",
    });
    // canAccess is called by useCanAccess (react-admin access control).
    // The mock stub returns undefined by default which react-query rejects.
    // Return {canAccess: true} so Edit components render normally.
    authProvider.canAccess.mockResolvedValue(true);

    const dataProvider = mock<DataProvider>();
    // Default getOne returns an empty record so useEditController doesn't throw.
    dataProvider.getOne.mockResolvedValue({ data: { id: "test-id" } } as any);
    // Default list/many responses for Reference* fields
    dataProvider.getList.mockResolvedValue({ data: [], total: 0 } as any);
    dataProvider.getManyReference.mockResolvedValue({
      data: [],
      total: 0,
    } as any);
    dataProvider.getMany.mockResolvedValue({ data: [] } as any);

    // Shared QueryClient with retry disabled for fast test failures.
    // Passed to AdminContext so both AdminContext and any outer component
    // using useQueryClient() share the same instance.
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    await use({
      authProvider,
      dataProvider,
      queryClient,
    });

    queryClient.clear();
    mockClear(authProvider);
    mockClear(authProvider);
  },
  render: async ({ mocks }, use) => {
    await use(renderWithAdminContext(mocks));
  },
});
