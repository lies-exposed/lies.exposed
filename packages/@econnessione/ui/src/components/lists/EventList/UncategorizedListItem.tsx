import {
  Actor,
  Group,
  GroupMember,
  Keyword
} from "@econnessione/shared/io/http";
import { Box, Grid } from "@material-ui/core";
import * as React from "react";
import { SearchUncategorizedEvent } from "./EventListItem";
import EventListItemBase from "./EventListItemHeader";

interface UncategorizedListItemProps {
  item: SearchUncategorizedEvent;
  onClick?: (e: SearchUncategorizedEvent) => void;
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
        maxWidth: '100%'
      }}
    >
      <Grid container spacing={2} style={{ width: "100%", maxWidth: '100%' }}>
        <EventListItemBase
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
