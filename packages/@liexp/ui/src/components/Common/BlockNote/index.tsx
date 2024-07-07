import * as React from "react";
import type { BNEditorProps } from "./Editor";

let BNEditor: any;

if (typeof window === "undefined") {
  // eslint-disable-next-line react/display-name
  BNEditor = (): JSX.Element => <div />;
} else {
  BNEditor = React.lazy(() =>
    import("./Editor").then((module) => ({ default: module.BNEditor })),
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
