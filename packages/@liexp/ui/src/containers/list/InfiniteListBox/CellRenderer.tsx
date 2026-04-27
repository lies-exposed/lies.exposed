import * as React from "react";
import { type CellRendererProps } from "./InfiniteMasonry.js";

export const CellRenderer = (
  children: (props: CellRendererProps) => React.JSX.Element,
) =>
  React.forwardRef<any, CellRendererProps>(
    (
      { item, measure, index, style, columnWidth, onRowInvalidate, ...others },
      ref,
    ) => {
      React.useEffect(() => {
        measure();
        return () => {
          onRowInvalidate?.();
        };
      }, [measure, onRowInvalidate, style?.width, style?.height]);

      return (
        <div ref={ref} style={{ ...style, overflow: "hidden" }}>
          {children({
            item,
            measure,
            index,
            columnWidth,
            style,
            ...others,
          })}
        </div>
      );
    },
  );
