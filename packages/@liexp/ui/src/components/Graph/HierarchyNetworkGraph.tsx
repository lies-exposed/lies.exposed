import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { type SearchEvent } from "@liexp/io/lib/http/Events/SearchEvents/SearchEvent.js";
import { EventTypes } from "@liexp/io/lib/http/Events/index.js";
import { GROUPS } from "@liexp/io/lib/http/Group.js";
import { KEYWORDS } from "@liexp/io/lib/http/Keyword.js";
import { type NetworkLink } from "@liexp/io/lib/http/Network/Network.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/io/lib/http/index.js";
import { Schema } from "effect";
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
    links: {
      source: string | number;
      target: string | number;
      value?: number;
      fill?: string;
      sourceType?: string;
      stroke?: string;
    }[];
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

  const nodeData = React.useMemo(
    () =>
      props.graph.nodes.map((n) => ({
        data: n.data,
        index: 0,
        id: n.data.id,
      })),
    [props.graph.nodes],
  );

  const linkData = React.useMemo(
    () =>
      props.graph.links.map((l) => ({
        source: l.source,
        target: l.target,
        value: l.value,
        fill: l.fill,
        sourceType: l.sourceType,
        stroke: l.stroke,
      })),
    [props.graph.links],
  );

  return (
    <ForcedNetworkGraph
      id={`hierarchy-network`}
      width={width}
      height={height}
      nodes={nodeData}
      links={linkData as NetworkLink[]}
      linkSource={(l) => String(l.source)}
      linkTarget={(l) => String(l.target)}
      onClick={(m) => {
        const data = m.data as { type: string };
        if (data.type === ACTORS.literals[0]) {
          onActorClick?.(m.data as Actor.Actor);
        } else if (data.type === GROUPS.literals[0]) {
          onGroupClick?.(m.data as Group.Group);
        } else if (data.type === KEYWORDS.literals[0]) {
          onKeywordClick?.(m.data as Keyword.Keyword);
        } else {
          onEventClick?.(m.data as SearchEvent);
        }
      }}
      nodeGroups={[
        ACTORS.literals[0],
        KEYWORDS.literals[0],
        GROUPS.literals[0],
      ]}
      colors={colors}
      nodeId={(n) => String((n.data as { id: string }).id)}
      linkStrokeWidth={(l) => l.value ?? 0}
      linkStrength={(l) => l.value ?? 0}
      linkStroke={(l) => l.fill ?? ''}
      nodeTitle={(n) => {
        const data = n.data as { type: string; tag?: string; name?: string; fullName?: string; title?: string };
        if (data.type === KEYWORDS.literals[0]) {
          return data.tag ?? '';
        } else if (data.type === GROUPS.literals[0]) {
          return data.name ?? '';
        } else if (data.type === ACTORS.literals[0]) {
          return data.fullName ?? '';
        }

        return data.title ?? '';
      }}
      nodeRadius={(_n) => 14}
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
        const data = n.data as { type: string; fullName?: string; tag?: string; name?: string };
        if (data.fullName) {
          return 0;
        }

        if (data.tag) {
          return 1;
        }

        if (data.name) {
          return 2;
        }

        if (Schema.is(EventTypes.DEATH)(data.type)) {
          return 3;
        }

        if (Schema.is(EventTypes.DOCUMENTARY)(data.type)) {
          return 3;
        }

        if (Schema.is(EventTypes.SCIENTIFIC_STUDY)(data.type)) {
          return 3;
        }

        if (Schema.is(EventTypes.PATENT)(data.type)) {
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
