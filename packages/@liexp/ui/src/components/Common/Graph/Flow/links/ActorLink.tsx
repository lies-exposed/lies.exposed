import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import {
  BaseEdge,
  type Edge,
  type EdgeProps,
  // EdgeLabelRenderer,
  Position,
  getBezierPath,
} from "@xyflow/react";
import * as React from "react";

export type ActorLinkType = Edge<typeof Actor.Type, typeof Actor.name>;

export const ActorLink: React.FC<EdgeProps<ActorLinkType>> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition = Position.Bottom,
    targetPosition = Position.Top,
    label,
    labelStyle,
    labelShowBg,
    labelBgStyle,
    labelBgPadding,
    labelBgBorderRadius,
    style,
    markerEnd,
    markerStart,
    pathOptions,
    interactionWidth,
    data,
  } = props;
  // console.log(
  //   "actor link",
  //   id,
  //   sourceX,
  //   sourceY,
  //   targetX,
  //   targetY,
  //   sourcePosition,
  //   targetPosition,
  //   markerEnd,
  //   markerStart,
  //   data,
  // );

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: pathOptions?.curvature,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelStyle={labelStyle}
      labelBgBorderRadius={labelBgBorderRadius}
      labelBgPadding={labelBgPadding}
      labelBgStyle={labelBgStyle}
      labelShowBg={labelShowBg}
      style={{
        ...style,
        stroke: data?.color ? toColorHash(data.color) : style?.stroke,
      }}
      markerEnd={markerEnd}
      markerStart={markerStart}
      interactionWidth={interactionWidth}
    />
  );
};
