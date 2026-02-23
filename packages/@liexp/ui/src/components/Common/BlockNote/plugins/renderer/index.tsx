import * as React from "react";
import type { InlineRelationsPluginProps } from "./InlineRelationsBoxPlugin.js";
import type { TOCRendererProps } from "./TOCPlugin.js";

// Lazy-load TOCPlugin to avoid bundling unnecessary dependencies
const TOCPlugin = React.lazy(() =>
  import("./TOCPlugin.js").then((module) => ({ default: module.TOCPlugin })),
);

const TOCPluginWrapper: React.FC<TOCRendererProps> = (props) => {
  return (
    <React.Suspense fallback={<div />}>
      <TOCPlugin {...props} />
    </React.Suspense>
  );
};

// Lazy-load InlineRelationsPlugin to avoid bundling unnecessary dependencies
const InlineRelationsPluginLazy = React.lazy(() =>
  import("./InlineRelationsBoxPlugin.js").then((module) => ({
    default: module.InlineRelationsPlugin,
  })),
);

const InlineRelationsPluginWrapper: React.FC<InlineRelationsPluginProps> = (
  props,
) => {
  return (
    <React.Suspense fallback={<div />}>
      <InlineRelationsPluginLazy {...props} />
    </React.Suspense>
  );
};

export {
  TOCPluginWrapper as TOCPlugin,
  InlineRelationsPluginWrapper as InlineRelationsPlugin,
};
