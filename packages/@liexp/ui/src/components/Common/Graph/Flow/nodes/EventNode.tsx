import { type Events } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { useConfiguration } from "../../../../../context/ConfigurationContext.js";
import EventCard from "../../../../Cards/Events/EventCard.js";
import { EventIcon } from "../../../Icons/index.js";

export const EventNode: React.FC<NodeProps<Events.SearchEvent.SearchEvent>> = ({
  data,
  targetPosition,
  sourcePosition,
  selected,
}) => {
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
              opacity: (data as any).selected ? 1 : 0.5,
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
};
