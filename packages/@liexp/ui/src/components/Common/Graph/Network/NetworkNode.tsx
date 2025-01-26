import { type NetworkNodeDatum } from "@liexp/shared/lib/io/http/Network/Network.js";
import { Group } from "@visx/group";
import * as React from "react";

export interface NetworkNodeProps<Datum extends NetworkNodeDatum> {
  node: Datum;
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: Datum,
  ) => void;
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void;
  onClick: (event: Datum) => void;
}

export const NetworkNode = <D extends NetworkNodeDatum>({
  node,
  onClick,
  onMouseOver,
  onMouseOut,
}: NetworkNodeProps<D>): React.ReactElement => {
  const groupProps = {
    ...(onMouseOver !== undefined
      ? {
          onMouseOver: (
            event: React.MouseEvent<SVGElement, React.MouseEvent>,
          ) => {
            onMouseOver(event, node);
          },
        }
      : {}),
    ...(onMouseOut !== undefined
      ? {
          onMouseOut,
        }
      : {}),
  };

  const innerCircleColor = node.innerColor;
  const outerCircleColor = node.outerColor;

  return (
    <Group
      {...(groupProps as any)}
      onClick={() => {
        onClick(node);
      }}
    >
      <>
        <circle r={8} fill={outerCircleColor} />
        <circle r={6} fill={innerCircleColor} />
      </>
    </Group>
  );
};
