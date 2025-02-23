import * as React from "react";
import type { CellRendererProps } from "./InfiniteMasonry";

export const CellRenderer = (
  children: (props: CellRendererProps) => React.JSX.Element,
) =>
  React.forwardRef<any, CellRendererProps>(
    (
      { item, measure, index, style, columnWidth, onRowInvalidate, ...others },
      ref,
    ) => {
      // console.log("cell renderer", index, item, columnWidth, style);
      React.useEffect(() => {
        measure();
        return () => {
          // console.log("should call on row invalidate");
          // onRowInvalidate?.();
        };
      }, [style?.width, style?.height]);

      return (
        <div ref={ref} style={{ ...style, overflow: "hidden" }}>
          {children({ item, measure, index, columnWidth, ...others })}
        </div>
      );
    },
  );
