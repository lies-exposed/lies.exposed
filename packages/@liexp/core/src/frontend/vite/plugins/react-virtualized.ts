import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { PluginOption } from "vite";
import { commonJSRequire } from "../utils.js";
// ...

export function reactVirtualized(): PluginOption {
  const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

  return {
    name: "react-virtualized:replace-window-scroller",
    async configResolved() {
      const reactVirtualizedPath = commonJSRequire("react-virtualized");

      const brokenFilePath = path.join(
        reactVirtualizedPath,
        "..", // back to dist
        "es",
        "WindowScroller",
        "utils",
        "onScroll.js",
      );
      const brokenCode = await readFile(brokenFilePath, "utf-8");

      const fixedCode = brokenCode.replace(WRONG_CODE, "");
      await writeFile(brokenFilePath, fixedCode);
    },
  };
}
