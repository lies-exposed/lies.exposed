import { Group } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { GroupListItem } from "../../../../lists/GroupList.js";

export const GroupNode: React.FC<NodeProps<Group.Group>> = ({
  data,
  style,
}: any) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200, zIndex: 10, ...style }}>
        <Handle type="source" position={Position.Bottom} />
        <GroupListItem item={{ selected: true, ...data }} displayName={false} />
        {/* <Handle type="target" position={Position.Left} /> */}
      </div>
    </React.Suspense>
  );
};
