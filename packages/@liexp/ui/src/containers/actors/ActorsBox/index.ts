import * as React from "react";

export const ActorsBox = React.lazy(() => import("./ActorsBox.js"));
export const ActorsBoxWrapper = React.lazy(() =>
  import("./ActorsBox.js").then((m) => ({ default: m.ActorsBoxWrapper })),
);
