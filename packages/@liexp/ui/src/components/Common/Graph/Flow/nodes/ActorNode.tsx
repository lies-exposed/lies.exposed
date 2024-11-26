import { type Actor } from "@liexp/shared/lib/io/http/index.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
import { ActorListItem } from "../../../../lists/ActorList.js";

export type ActorNodeType = Node<Actor.Actor, typeof Actor.Actor.name>;

// eslint-disable-next-line react/display-name
export const ActorNode = React.memo<NodeProps<ActorNodeType>>(
  ({ data, selected }) => {
    return (
      <div style={{ maxWidth: 200 }}>
        <Handle type="target" position={Position.Top} />
        <ActorListItem
          item={{ ...data, selected: !!selected }}
          displayFullName={false}
        />
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  },
);
