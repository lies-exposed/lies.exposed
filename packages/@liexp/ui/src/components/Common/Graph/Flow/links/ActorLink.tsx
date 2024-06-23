import * as React from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "reactflow";

export const ActorLink: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  return (
    <div key={id}>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{ ...style }}
      />
      {/* <EdgeLabelRenderer>
               <div
                style={{
                  position: "absolute",
                  transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                  fontSize: 12,
                  backgroundColor: `${data.color}`,
                  // everything inside EdgeLabelRenderer has no pointer events by default
                  // if you have an interactive element, set pointer-events: all
                  pointerEvents: "all",
                }}
                className="nodrag nopan"
              >
                <button className="edgebutton" onClick={(event) => {}}>
                  ×
                </button>
              </div>
            </EdgeLabelRenderer> */}
    </div>
  );
};
