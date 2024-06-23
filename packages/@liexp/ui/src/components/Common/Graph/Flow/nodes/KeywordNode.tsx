import * as React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { KeywordListItem } from "../../../../lists/KeywordList.js";

export const KeywordNode: React.FC<NodeProps> = ({ yPos, data }) => {
  return (
    <React.Suspense>
      <div style={{ maxWidth: 200 }}>
        <Handle type="source" position={Position.Bottom} />
        <KeywordListItem item={data} />
      </div>
    </React.Suspense>
  );
};
