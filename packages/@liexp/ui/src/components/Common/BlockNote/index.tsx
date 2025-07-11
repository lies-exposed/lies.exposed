import * as React from "react";
import type { BNEditorProps } from "./Editor.js";

let BNEditor:
  | React.FC<BNEditorProps>
  | React.LazyExoticComponent<React.FC<BNEditorProps>>;

if (typeof window === "undefined") {
  BNEditor = (): React.ReactElement => <div />;
} else {
  BNEditor = React.lazy(() =>
    import("./Editor.js").then((module) => ({ default: module.BNEditor })),
  );
}

const BNEditorWrapper: React.FC<BNEditorProps> = (props) => {
  return (
    <React.Suspense fallback={<div />}>
      <BNEditor {...props} />
    </React.Suspense>
  );
};

export { BNEditorWrapper as BNEditor, BNEditorProps };
