/* eslint-disable one-var */

import path from "path";

const makeAliases = (
  baseURL: string,
  paths: Record<string, string[]>
): Record<string, string> => {
  const fromPaths = Object.keys(paths).reduce((aliases, key) => {
    const targets = paths[key];
    if (targets.length !== 1) {
      throw new Error(`Multiple aliases for ${key}`);
    }
    const alias = key.replace(/\/\*$/, "");
    const targetPath = path
      .resolve(__dirname, baseURL, targets[0])
      .replace(/\/\*$/, "");
    return {
      ...aliases,
      [alias]: targetPath,
    };
  }, {});

  // const fromDirs = fs
  //   .readdirSync(path.resolve(__dirname, baseURL))
  //   .filter(dir => dir.includes())
  //   .reduce((aliases, dir) => {
  //     const target = path.resolve(__dirname, baseURL, dir);
  //     const stat = fs.statSync(target);
  //     if (stat.isDirectory()) {
  //       return {
  //         ...aliases,
  //         [dir]: target,
  //       };
  //     }
  //     return aliases;
  //   }, {});

  return { ...fromPaths };
};

export { makeAliases };
