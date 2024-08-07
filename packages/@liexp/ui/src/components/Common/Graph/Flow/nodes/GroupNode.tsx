import { type Group } from "@liexp/shared/lib/io/http/index.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
import { GroupListItem } from "../../../../lists/GroupList.js";

export type GroupNodeType = Node<Group.Group, typeof Group.Group.name>;

// eslint-disable-next-line react/display-name, @typescript-eslint/no-redundant-type-constituents
export const GroupNode = React.memo<NodeProps<GroupNodeType>>(({ data }) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200, zIndex: 10 }}>
        <Handle type="source" position={Position.Bottom} />
        <GroupListItem item={{ selected: true, ...data }} displayName={false} />
        {/* <Handle type="target" position={Position.Left} /> */}
      </div>
    </React.Suspense>
  );
});
