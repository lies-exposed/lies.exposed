import { hierarchy } from "@vx/hierarchy";
import * as React from "react";
import Pack, { PackDatum } from "./Pack";

interface BubbleGraphProps<D extends PackDatum> {
  width: number;
  height: number;
  data: D[];
  onClick?: () => void;
}

export const BubbleGraph = <D extends PackDatum>({
  width,
  height,
  data,
  ...props
}: BubbleGraphProps<D>): JSX.Element => {
  const pack = hierarchy<D>({ children: [{ children: data }] } as any).sum(
    (n) => n.count
  );

  return <Pack width={width} height={height} pack={pack} {...props} />;
};
