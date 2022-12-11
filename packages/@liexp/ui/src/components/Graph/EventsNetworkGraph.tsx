import { getTitle } from "@liexp/shared/helpers/event/getTitle.helper";
import { Actor, Group, Keyword } from "@liexp/shared/io/http";
import { ACTORS } from "@liexp/shared/io/http/Actor";
import { DEATH } from "@liexp/shared/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/io/http/Events/Patent";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { SearchEvent } from "@liexp/shared/io/http/Events/SearchEvent";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { EventNetworkDatum } from "@liexp/shared/io/http/Network/networks";
import * as React from "react";
import { ForcedNetworkGraph } from "../Common/Graph/ForcedNetworkGraph";
import { NetworkScale } from "../Common/Graph/Network/Network";
import { EventTypeColor } from "../Common/Icons";

export type EventsNetworkGraphPropsGroupBy = "group" | "actor" | "keyword";

export interface EventsNetworkGraphProps {
  events: SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  graph: {
    nodes: EventNetworkDatum[];
    links: any[];
  };
  selectedActorIds?: string[];
  selectedGroupIds?: string[];
  selectedKeywordIds?: string[];
  scale?: NetworkScale;
  onEventClick?: (e: SearchEvent) => void;
  height: number;
  width: number;
}

export const EventsNetworkGraph: React.FC<EventsNetworkGraphProps> = ({
  width,
  height,
  onEventClick,
  ...props
}) => {
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
    []
  );

  // console.log(networkProps);
  // console.log(networkProps.graph.links);
  // const links = networkProps.graph.links.filter(
  //   (l) =>
  //     !!networkProps.graph.nodes.find(
  //       (n) => n.id === l.source || n.id === l.target
  //     )
  // );

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
        onEventClick?.(m);
      }}
      nodeGroups={[ACTORS.value, KEYWORDS.value, GROUPS.value]}
      colors={colors}
      nodeId={(n) => n.id}
      linkStrokeWidth={(l) => l.value}
      nodeTitle={(n) => {
        return (
          n.tag ??
          n.fullName ??
          n.name ??
          getTitle(n, {
            actors: [],
            groups: [],
            groupsMembers: [],
            keywords: [],
            media: [],
          })
        );
      }}
      nodeRadius={(n) => n.value ?? 10}
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
        if (n.fullName) {
          return 0;
        }

        if (n.tag) {
          return 1;
        }

        if (n.name) {
          return 2;
        }

        if (DEATH.is(n.type)) {
          return 3;
        }

        if (DOCUMENTARY.is(n.type)) {
          return 3;
        }

        if (SCIENTIFIC_STUDY.is(n.type)) {
          return 3;
        }

        if (PATENT.is(n.type)) {
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
