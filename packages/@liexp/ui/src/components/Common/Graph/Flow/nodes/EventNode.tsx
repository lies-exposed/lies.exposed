import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
// import { useConfiguration } from "../../../../../context/ConfigurationContext.js";
import { EventIcon } from "../../../Icons/index.js";

export type EventNodeType = Node<any, "EventV2"> & {
  data: Events.SearchEvent.SearchEvent;
};

export const EventNode = React.memo<NodeProps<EventNodeType>>(
  ({ data, targetPosition, sourcePosition, selected: _selected }) => {
    // const conf = useConfiguration();
    const selected = !!_selected;

    return (
      <React.Suspense>
        <div style={{ maxWidth: 300, zIndex: selected ? 1000 : 0 }}>
          <Handle type="target" position={Position.Bottom} />
          <EventIcon
            type={data.type}
            style={{
              opacity: selected ? 1 : 0.5,
            }}
          />
          <Handle type="source" position={Position.Top} />
        </div>
      </React.Suspense>
    );
  },
);
