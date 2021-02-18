import { Link } from "@vx/network/lib/types";
import { LinkVertical } from "@vx/shape";
import * as React from "react";
import { NetworkNodeDatum, NetworkPointNode } from "./NetworkNode";

export interface NetworkLinkProps<N extends NetworkNodeDatum>
  extends Link<NetworkPointNode<N>> {
  stroke: string;
}

const NetworkLink = <N extends NetworkNodeDatum>({
  source,
  target,
  stroke,
}: NetworkLinkProps<N>): JSX.Element => {
  return (
    <LinkVertical
      key={`link-${source.data.id}-${target.data.id}`}
      data={{ source, target }}
      stroke={stroke}
      strokeWidth="2"
      fill="transparent"
    />
  );
};
export default NetworkLink;
