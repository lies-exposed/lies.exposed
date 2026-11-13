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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pack = hierarchy<D>({ children: [{ children: data }] } as any).sum(
    (n) => n.count,
  );

  return (
    <Pack
      width={width}
      height={height}
      pack={pack as unknown as HierarchyNode<PackDatum>}
      variant={variant}
      onClick={onClick as (d: PackDatum) => void}
    />
  );
};
