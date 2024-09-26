type Operation = (column: string, paths: string[], valueKey: string) => string;

interface Operations {
  every: Operation;
  some: Operation;
}

const joinPaths = (paths: string[], last?: string): string =>
  paths
    .map((p) => `'${p}'`)
    .reduce(
      (acc, p, i) =>
        acc.concat(`${i === paths.length - 1 ? last : " -> "} ${p}`),
      "",
    );

const StringsOperators = {
  Eq: (column: string, paths: string[], value: string) => {
    return `${column}::jsonb ${joinPaths(paths, "->>")} = '${value}'`;
  },
};

const Array: Operations = {
  every: (column, paths, valueKey) =>
    `${column}::jsonb -> ${joinPaths(paths)} ?& ARRAY[:...${valueKey}]`,
  some: (column, paths, valueKey) =>
    `${column}::jsonb -> ${joinPaths(paths)} ?| ARRAY[:...${valueKey}]`,
};

export const JSONOperators = {
  Array,
  Strings: StringsOperators,
};
