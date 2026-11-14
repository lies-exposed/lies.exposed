import { hierarchy } from "@visx/hierarchy";
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
  ...props
}: BubbleGraphProps<D>): React.ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- visx hierarchy expects a root node type we construct from data
  const pack = hierarchy<D>({ children: [{ children: data }] } as any).sum(
    (n) => n.count,
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- D extends PackDatum but onClick type differs
  return <Pack width={width} height={height} pack={pack} {...(props as any)} />;
};
