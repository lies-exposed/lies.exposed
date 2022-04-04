import {
  Actor,
  Group,
  GroupMember,
  Keyword,
  Events,
} from "@liexp/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import * as React from "react";

import EventListItemBase from "./EventListItemBase";

interface UncategorizedListItemProps {
  item: Events.SearchEvent.SearchUncategorizedEvent;
  onClick?: (e: Events.SearchEvent.SearchUncategorizedEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onGroupClick?: (e: Group.Group) => void;
  onGroupMemberClick?: (g: GroupMember.GroupMember) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

export const UncategorizedListItem: React.FC<UncategorizedListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  ...props
}) => {
  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        marginBottom: 40,
        width: "100%",
        maxWidth: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <Grid container spacing={2} style={{ width: "100%", maxWidth: "100%" }}>
        <EventListItemBase
          type={Events.Uncategorized.UNCATEGORIZED.value}
          title={item.payload.title}
          excerpt={item.excerpt}
          keywords={item.keywords}
          media={item.media}
          links={item.links}
          onKeywordClick={onKeywordClick}
        />
      </Grid>
    </Box>
  );
};
