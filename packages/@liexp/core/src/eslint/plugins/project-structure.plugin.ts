interface Rule<T extends string = string> {
  ruleId?: T;
  name?: string;
  enforceExistence?: string[] | string;
  children?: Partial<Rule<string>>[];
}

interface FolderRecursionRule<T extends string = string> extends Rule<T> {
  folderRecursionLimit?: number;
}

const TEST_FOLDER: FolderRecursionRule<"test_folder"> = {
  name: "__tests__",
  children: [
    { name: "{camelCase}.e2e.ts" },
    {
      name: "{camelCase}.route.e2e.ts",
    },
    { name: "{camelCase}(.flow)?.spec.ts" },
  ],
};

const FLOW_FOLDER: FolderRecursionRule<"flow_folder"> = {
  name: "({camelCase}|{kebab-case}|{PascalCase})",
  folderRecursionLimit: 3,
  children: [
    { ruleId: "test_folder" },
    { ruleId: "flow_folder" },
    { name: "index.ts" },
    { name: "{camelCase}.flow.ts" },
    { name: "{camelCase}.flow.spec.ts" },
    { name: "({camelCase}|{PascalCase}).ts" },
    { name: "{PascalCase}.type.ts" },
  ],
};

const FLOWS_FOLDER: FolderRecursionRule<"flows_folder"> = {
  name: "flows",
  enforceExistence: ["flow.types.ts"],
  children: [{ ruleId: "flow_folder" }, { name: "flow.types.ts" }],
};

const TOOL_FOLDER: FolderRecursionRule<"tool_folder"> = {
  name: "{camelCase}",
  folderRecursionLimit: 2,
  children: [
    {
      ruleId: "tool_folder",
    },
    {
      name: "{folderName}.tools.ts",
    },
    {
      name: "*(.tools?)?.ts",
    },
    {
      ruleId: "test_folder",
    },
  ],
};

const ROUTE_FOLDER: FolderRecursionRule<"route_folder"> = {
  name: "({camelCase}|{kebab-case})",
  // Allow a maximum of three levels of nesting for the _{route}_ folder.
  folderRecursionLimit: 3,
  children: [
    { name: "index.ts" },
    { name: "{folderName}.(route|controller).ts" },
    { name: "{camelCase}.controller.ts" },
    { name: "({camelCase}|{PascalCase}).routes?.ts" },
    { name: "{camelCase}.io.ts" },

    // TODO: move to MCP config
    {
      name: "resources",
      children: [{ name: "index.ts" }, { name: "{camelCase}.resources.ts" }],
    },
    {
      name: "tools",
      children: [
        {
          name: "index.ts",
        },
        { name: "{camelCase}.tool.ts" },
        {
          name: "formatters",
          children: [{ name: "{camelCase}.formatter.ts" }],
        },
        { ruleId: "tool_folder" },
      ],
    },

    // Recursive patterns
    // recursively call this rule up to 3 times
    { ruleId: "route_folder" },
    {
      ruleId: "test_folder",
    },
  ],
};

const ROUTES_FOLDER: FolderRecursionRule<"routes_folder"> = {
  name: "routes",
  children: [
    {
      name: "route.types.ts",
    },
    { name: "endpoint.subscriber.ts" },
    { name: "index.ts" },
    { ruleId: "route_folder" },
  ],
};

const BIN_FOLDER: FolderRecursionRule<"bin_folder"> = {
  name: "bin",
  children: [{ name: "{kebab-case}.ts" }],
};

const QUERIES_FOLDER: FolderRecursionRule<"queries_folder"> = {
  name: "queries",
  children: [{ ruleId: "query_folder" }],
};
const SCRIPTS_FOLDER: FolderRecursionRule<"scripts_folder"> = {
  name: "scripts",
  children: [{ name: "{camelCase}.{camelCase}.ts" }],
};

const QUERY_FOLDER: FolderRecursionRule<"query_folder"> = {
  name: "{camelCase}",
  children: [
    {
      name: "{camelCase}.query.ts",
    },
  ],
};
export const RULES = {
  BIN_FOLDER: { ruleId: "bin_folder" },
  FLOW_FOLDER: { ruleId: "flow_folder" },
  FLOWS_FOLDER: { ruleId: "flows_folder" },
  TOOL_FOLDER: { ruleId: "tool_folder" },
  TEST_FOLDER: { ruleId: "test_folder" },
  ROUTE_FOLDER: { ruleId: "route_folder" },
  ROUTES_FOLDER: { ruleId: "routes_folder" },
  QUERY_FOLDER: { ruleId: "query_folder" },
  QUERIES_FOLDER: { ruleId: "queries_folder" },
  SCRIPTS_FOLDER: { ruleId: "scripts_folder" },
  rules: {
    test_folder: TEST_FOLDER,
    flow_folder: FLOW_FOLDER,
    flows_folder: FLOWS_FOLDER,
    tool_folder: TOOL_FOLDER,
    route_folder: ROUTE_FOLDER,
    routes_folder: ROUTES_FOLDER,
    bin_folder: BIN_FOLDER,
    query_folder: QUERY_FOLDER,
    queries_folder: QUERIES_FOLDER,
    scripts_folder: SCRIPTS_FOLDER,
  },
};
