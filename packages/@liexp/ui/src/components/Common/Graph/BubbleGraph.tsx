import { hierarchy } from "@visx/hierarchy";
import { type HierarchyNode } from "@visx/hierarchy/lib/types.js";
import type { HierarchyDatum } from "@visx/hierarchy/lib/types.js";
import * as React from "react";
import Pack, { type PackDatum } from "./Pack.js";

// Type for the hierarchy input structure
interface HierarchyInput<D> {
  children: { children: D[] };
}

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
    { children: [{ children: data }] } as HierarchyInput<D> & HierarchyDatum,
  ).sum((n) => n.count);

  return (
    <Pack
      width={width}
      height={height}
      // @ts-expect-error BlockNote's internal types are opaque
      pack={pack as unknown as HierarchyNode<PackDatum>}
      variant={variant}
      // @ts-expect-error onClick may be undefined
      onClick={onClick as (d: PackDatum) => void}
    />
  );
};
