import { type NetworkNodeDatum } from "@liexp/shared/lib/io/http/Network/Network.js";
import { type Link } from "@visx/network/lib/types.js";
import { LinkVertical } from "@visx/shape";
import * as React from "react";

export interface NetworkLinkProps<N extends NetworkNodeDatum> extends Link<N> {
  stroke: string;
}

const NetworkLink = <N extends NetworkNodeDatum>({
  source,
  target,
  stroke,
}: NetworkLinkProps<N>): React.ReactNode => {
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
