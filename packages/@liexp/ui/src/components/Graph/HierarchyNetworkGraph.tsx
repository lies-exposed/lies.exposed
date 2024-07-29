import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { ForcedNetworkGraph } from "../Common/Graph/ForcedNetworkGraph.js";
import { type NetworkScale } from "../Common/Graph/Network/Network.js";
import { type EventNetworkNodeProps } from "../Common/Graph/Network/nodes/EventNode.js";
import { EventTypeColor } from "../Common/Icons/index.js";

export type HierarchyNetworkGraphPropsGroupBy = "group" | "actor" | "keyword";

export interface HierarchyNetworkGraphProps {
  events: SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  graph: {
    nodes: EventNetworkNodeProps[];
    links: any[];
  };
  selectedActorIds?: string[];
  selectedGroupIds?: string[];
  selectedKeywordIds?: string[];
  scale?: NetworkScale;
  onEventClick?: (e: SearchEvent) => void;
  onActorClick?: (a: Actor.Actor) => void;
  onGroupClick?: (g: Group.Group) => void;
  onKeywordClick?: (k: Keyword.Keyword) => void;
  height: number;
  width: number;
}

export const HierarchyNetworkGraph: React.FC<HierarchyNetworkGraphProps> = ({
  width,
  height,
  onActorClick,
  onEventClick,
  onGroupClick,
  onKeywordClick,
  ...props
}) => {
  // console.log('hierarchy graph', props.graph);
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
      id={`hierarchy-network`}
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
        if (n.data.type === KEYWORDS.value) {
          return n.data.tag;
        } else if (n.data.type === GROUPS.value) {
          return n.data.name;
        } else if (n.data.type === ACTORS.value) {
          return n.data.fullName;
        }

        return n.data.title;
      }}
      nodeRadius={(n) => 14}
      // nodeStrength={(n) => {
      //   if (n.type === KEYWORDS.value) {
      //     return 1;
      //   } else if (n.type === ACTORS.value) {
      //     return 2;
      //   } else if (n.type === GROUPS.value) {
      //     return 3;
      //   }
      //   return 5;
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
