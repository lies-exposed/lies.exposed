import { type Group } from "@liexp/shared/lib/io/http/index.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
import { GroupListItem } from "../../../../lists/GroupList.js";

export type GroupNodeType = Node<Group.Group, typeof Group.Group.name>;

// eslint-disable-next-line react/display-name
export const GroupNode = React.memo<NodeProps<GroupNodeType>>(
  ({ data, selected }) => {
    return (
      <React.Suspense>
        <div style={{ maxWidth: 200, zIndex: 10 }}>
          <Handle type="source" position={Position.Bottom} />

          <GroupListItem
            item={{ ...data, selected: !!selected }}
            displayName={false}
          />
          <Handle type="target" position={Position.Left} />
        </div>
      </React.Suspense>
    );
  },
);
