import { extendBaseConfig } from "@liexp/backend/lib/test/vitest.base-config.js";

export default extendBaseConfig(import.meta.url, (toAlias) => ({
  root: toAlias("./"),
  test: {
    name: "admin-spec",
    root: toAlias("./"),
    globals: true,
    watch: false,
    environment: "jsdom",
    setupFiles: [toAlias("./test/specSetup.ts")],
    include: [toAlias("./src/**/*.spec.ts"), toAlias("./src/**/*.spec.tsx")],
    exclude: ["node_modules/**", "build/**", "**/*.e2e.*"],
    // Alias jsdom-incompatible UI components to lightweight stubs so spec
    // tests don't need to repeat vi.mock() calls in every file.
    alias: {
      "@liexp/ui/lib/components/admin/BlockNoteInput.js": toAlias(
        "./test/mocks/BlockNoteInput.mock.tsx",
      ),
      "@liexp/ui/lib/components/admin/previews/GroupPreview.js": toAlias(
        "./test/mocks/GroupPreview.mock.tsx",
      ),
      "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js":
        toAlias("./test/mocks/EventsFlowGraphFormTab.mock.tsx"),
      "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js":
        toAlias("./test/mocks/EventsNetworkGraphFormTab.mock.tsx"),
      "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js": toAlias(
        "./test/mocks/LazyFormTabContent.mock.tsx",
      ),
    },
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.e2e.*", "test/**", "node_modules/**", "build/**"],
      thresholds: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
  },
}));
