import {
  type Actor,
  type Group,
  type GroupMember,
  type Keyword,
  Events,
} from "@liexp/shared/lib/io/http";
import * as React from "react";
import { Box, Grid } from "../../mui";

import EventListItemBase from "./EventListItemBase";

interface UncategorizedListItemProps {
  item: Events.SearchEvent.SearchUncategorizedEvent;
  condensed?: boolean;
  onClick?: (e: Events.SearchEvent.SearchUncategorizedEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onGroupMemberClick?: (g: GroupMember.GroupMember) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchUncategorizedEvent) => void;
  onLoad?: () => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  onClick,
  condensed,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onRowInvalidate,
  onLoad,
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2} style={{ width: "100%", maxWidth: "100%" }}>
        <EventListItemBase
          event={item}
          type={Events.EventTypes.UNCATEGORIZED.value}
          title={item.payload.title}
          excerpt={item.excerpt}
          keywords={item.keywords}
          media={item.media}
          links={item.links}
          onKeywordClick={onKeywordClick}
          onRowInvalidate={onRowInvalidate}
          condensed={condensed}
          onLoad={onLoad}
        />
      </Grid>
    </Box>
  );
};
