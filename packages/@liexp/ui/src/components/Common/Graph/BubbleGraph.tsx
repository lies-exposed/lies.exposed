import { hierarchy } from "@visx/hierarchy";
import { type HierarchyNode } from "@visx/hierarchy/lib/types.js";
import * as React from "react";
import Pack, { type PackDatum } from "./Pack.js";

interface BubbleGraphProps<D extends PackDatum> {
  width: number;
  height: number;
  data: D[];
  onClick?: (d: D) => void;
  variant: "text" | "circle";
}

export const BubbleGraph = <D extends PackDatum>({
  width,
  height,
  data,
  onClick,
  variant,
}: BubbleGraphProps<D>): React.ReactNode => {
  const pack = hierarchy<D>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { children: [{ children: data }] } as any,
  ).sum((n) => n.count);

  return (
    <Pack
      width={width}
      height={height}
      pack={pack as HierarchyNode<PackDatum>}
      onClick={onClick as ((d: PackDatum) => void) | undefined}
      variant={variant}
    />
  );
};
