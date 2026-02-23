import * as React from "react";
import type { AreasMapProps } from "./AreasMap.js";

// Lazy-load AreasMap to avoid bundling 14MB OpenLayers library
// Only loaded when areas need to be displayed on the page
const AreasMapLazy = React.lazy(() => import("./AreasMap.js"));

const AreasMapWrapper: React.FC<AreasMapProps> = (props) => {
  return (
    <React.Suspense fallback={<div />}>
      <AreasMapLazy {...props} />
    </React.Suspense>
  );
};

export { AreasMapWrapper as AreasMap };
export type { AreasMapProps };
