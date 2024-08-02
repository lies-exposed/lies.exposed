import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { Handle, type NodeProps, Position, type Node } from "@xyflow/react";
import * as React from "react";
import { useConfiguration } from "../../../../../context/ConfigurationContext.js";
import EventCard from "../../../../Cards/Events/EventCard.js";
import { EventIcon } from "../../../Icons/index.js";

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type EventNodeType = Node<any, "EventV2"> & {
  data: Events.SearchEvent.SearchEvent;
};

// eslint-disable-next-line react/display-name
export const EventNode = React.memo<
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  NodeProps<EventNodeType>
>(({ data, targetPosition, sourcePosition, selected }) => {
  const conf = useConfiguration();
  return (
    <React.Suspense>
      <div style={{ maxWidth: 300, zIndex: selected ? 1000 : 0 }}>
        {targetPosition ? (
          <Handle type="target" position={Position.Bottom} />
        ) : null}
        {!selected ? (
          <EventIcon
            type={data.type}
            style={{
              opacity: data.selected ? 1 : 0.5,
            }}
          />
        ) : (
          <EventCard
            event={data}
            showMedia={true}
            showRelations={false}
            defaultImage={conf.platforms.web.defaultImage}
          />
        )}
        {sourcePosition ? (
          <Handle type="source" position={Position.Top} />
        ) : null}
      </div>
    </React.Suspense>
  );
});
