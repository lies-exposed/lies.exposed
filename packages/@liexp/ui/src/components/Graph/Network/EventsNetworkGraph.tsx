import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import { type NetworkLink } from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { ForcedNetworkGraph } from "../../Common/Graph/ForcedNetworkGraph.js";
import { type NetworkScale } from "../../Common/Graph/Network/Network.js";
import { type ActorNetworkNodeProps } from "../../Common/Graph/Network/nodes/ActorNode.js";
import { type EventNetworkNodeProps } from "../../Common/Graph/Network/nodes/EventNode.js";
import { type GroupNetworkNodeProps } from "../../Common/Graph/Network/nodes/GroupNode.js";
import { type KeywordNetworkNodeProps } from "../../Common/Graph/Network/nodes/KeywordNode.js";
import { EventTypeColor } from "../../Common/Icons/index.js";

export type EventsNetworkGraphPropsGroupBy = "group" | "actor" | "keyword";

export interface EventsNetworkGraphProps {
  events: SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  graph: {
    nodes: (
      | EventNetworkNodeProps
      | ActorNetworkNodeProps
      | GroupNetworkNodeProps
      | KeywordNetworkNodeProps
    )[];
    links: NetworkLink[];
  };
  scale?: NetworkScale;
  onEventClick?: (e: SearchEvent) => void;
  onActorClick?: (a: Actor.Actor) => void;
  onGroupClick?: (g: Group.Group) => void;
  onKeywordClick?: (k: Keyword.Keyword) => void;
  height: number;
  width: number;
}

export const EventsNetworkGraph: React.FC<EventsNetworkGraphProps> = ({
  width,
  height,
  onActorClick,
  onEventClick,
  onGroupClick,
  onKeywordClick,
  ...props
}) => {
  // console.log("events network graph", props.graph);
  // const [groupBy] = React.useState(props.groupBy);

  const colors = React.useMemo(
    () => [
      EventTypeColor.Uncategorized,
      EventTypeColor.Death,
      EventTypeColor.Documentary,
      EventTypeColor.ScientificStudy,
      EventTypeColor.Patent,
      "#a3a3a3",
    ],
    [],
  );

  return (
    <ForcedNetworkGraph
      id={`events-network`}
      width={width}
      height={height}
      nodes={props.graph.nodes}
      links={props.graph.links}
      linkSource={(l) => l.source}
      linkTarget={(l) => l.target}
      onClick={(m) => {
        if (m.type === ACTORS.value) {
          onActorClick?.(m);
        } else if (m.type === GROUPS.value) {
          onGroupClick?.(m);
        } else if (m.type === KEYWORDS.value) {
          onKeywordClick?.(m);
        } else {
          onEventClick?.(m);
        }
      }}
      nodeGroups={[ACTORS.value, KEYWORDS.value, GROUPS.value]}
      colors={colors}
      nodeId={(n) => n.data.id}
      linkStrokeWidth={(l) => l.value}
      linkStrength={(l) => l.value}
      linkStroke={(l) => l.fill}
      nodeTitle={(n) => {
        // console.log('node title', n);
        if (n.data.type === KEYWORDS.value) {
          return n.data.tag;
        } else if (n.data.type === GROUPS.value) {
          return n.data.name;
        } else if (n.data.type === ACTORS.value) {
          return n.data.fullName;
        }

        return n.data.title;
      }}
      nodeRadius={(n) => (n.data.count ?? 0) + 10}
      // nodeStrength={(n) => {
      //   if (n.type === KEYWORDS.value) {
      //     return 1 / n.count;
      //   } else if (n.type === ACTORS.value) {
      //     return 10;
      //   } else if (n.type === GROUPS.value) {
      //     return 10;
      //   }
      //   return 10;
      // }}
      nodeGroup={(n) => {
        if (n.data.fullName) {
          return 0;
        }

        if (n.data.tag) {
          return 1;
        }

        if (n.data.name) {
          return 2;
        }

        if (EventTypes.DEATH.is(n.data.type)) {
          return 3;
        }

        if (EventTypes.DOCUMENTARY.is(n.data.type)) {
          return 3;
        }

        if (EventTypes.SCIENTIFIC_STUDY.is(n.data.type)) {
          return 3;
        }

        if (EventTypes.PATENT.is(n.data.type)) {
          return 3;
        }

        return 3;
      }}
      // invalidation={() =>
      //   throwTE(sleep(2000)).then(() => console.log("invalidate simulation"))
      // }
      // tooltipRenderer={(event) => {

      //   return (
      //     <Box border={1}>
      //       <EventListItem
      //         event={event}
      //         onClick={() => {}}
      //         onActorClick={() => {}}
      //         onGroupClick={() => {}}
      //         onKeywordClick={() => {}}
      //         onGroupMemberClick={() => {}}
      //         onRowInvalidate={() => {}}
      //       />
      //     </Box>
      //   );
      // }}
    />
  );
};
