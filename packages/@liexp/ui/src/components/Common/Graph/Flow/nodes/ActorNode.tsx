import React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { ActorListItem } from "../../../../lists/ActorList.js";

export const ActorNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div style={{ maxWidth: 200 }}>
      <ActorListItem item={data} displayFullName={false} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};
