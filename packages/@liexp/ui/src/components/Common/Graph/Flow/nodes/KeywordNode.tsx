import { type Keyword } from "@liexp/shared/lib/io/http/Keyword.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
import { KeywordListItem } from "../../../../lists/KeywordList.js";

export type KeywordNodeType = Node<Keyword, typeof Keyword.name>;

export const KeywordNode = React.memo<NodeProps<KeywordNodeType>>(
  ({ data, selected }) => {
    return (
      <React.Suspense>
        <div style={{ maxWidth: 200 }}>
          <Handle type="target" position={Position.Top} />
          <KeywordListItem item={{ ...data, selected: !!selected }} />
          <Handle type="source" position={Position.Bottom} />
        </div>
      </React.Suspense>
    );
  },
);
