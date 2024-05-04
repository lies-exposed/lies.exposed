import { Group } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Handle, NodeProps, NodeResizer, Position } from "reactflow";

export const GroupBoxNode: React.FC<
  NodeProps<Group.Group> & { style?: React.CSSProperties }
> = ({ data, style, ...rest }) => {
  return (
    <div style={style}>
      <Handle type={"target"} position={rest.targetPosition ?? Position.Top} />
      <Handle
        type={"source"}
        position={rest.sourcePosition ?? Position.Bottom}
      />
      <NodeResizer isVisible={true} minWidth={180} minHeight={100} />
      <div>
        <h3>{data.name}</h3>
      </div>
    </div>
  );
};
