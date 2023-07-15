import { type Link } from "@visx/network/lib/types";
import { LinkVertical } from "@visx/shape";
import * as React from "react";
import { type NetworkNodeDatum } from "./NetworkNode";

export interface NetworkLinkProps<N extends NetworkNodeDatum> extends Link<N> {
  stroke: string;
}

const NetworkLink = <N extends NetworkNodeDatum>({
  source,
  target,
  stroke,
}: NetworkLinkProps<N>): JSX.Element => {
  return (
    <LinkVertical
      key={`link-${source.id}-${target.id}`}
      data={{ source, target }}
      stroke={stroke}
      strokeWidth="2"
      fill="transparent"
    />
  );
};
export default NetworkLink;
