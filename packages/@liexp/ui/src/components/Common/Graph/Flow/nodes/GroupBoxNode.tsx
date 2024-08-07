import { type Group } from "@liexp/shared/lib/io/http/index.js";
import {
  Handle,
  type Node,
  type NodeProps,
  NodeResizer,
  Position,
} from "@xyflow/react";
import * as React from "react";

export type GroupBoxNodeType = Node<Group.Group, "group">;

// eslint-disable-next-line react/display-name, @typescript-eslint/no-redundant-type-constituents
export const GroupBoxNode = React.memo<NodeProps<GroupBoxNodeType>>(
  ({ data, ...rest }) => {
    return (
      <div style={{}}>
        <Handle
          type={"target"}
          position={rest.targetPosition ?? Position.Top}
        />
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
  },
);
