import { hierarchy } from "@visx/hierarchy";
import * as React from "react";
import Pack, { type PackDatum } from "./Pack.js";

interface BubbleNode extends PackDatum {
  children?: BubbleNode[];
}

interface BubbleGraphProps {
  width: number;
  height: number;
  data: BubbleNode[];
  onClick?: (d: PackDatum) => void;
  variant: "text" | "circle";
}

const wrapper = (children: BubbleNode[]): BubbleNode => ({
  label: "",
  count: 0,
  color: "",
  children,
});

export const BubbleGraph = ({
  width,
  height,
  data,
  ...props
}: BubbleGraphProps): React.ReactNode => {
  const pack = hierarchy<BubbleNode>(wrapper([wrapper(data)])).sum(
    (n) => n.count,
  );

  return <Pack width={width} height={height} pack={pack} {...props} />;
};
