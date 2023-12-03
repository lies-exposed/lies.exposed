import {
  type Events,
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http";
import { type InlineRelations } from "@liexp/shared/lib/slate/utils";
import * as React from "react";
import ActorsBox from "../../../../../containers/ActorsBox";
import { GroupsBox } from "../../../../../containers/GroupsBox";
import { MediaBox } from "../../../../../containers/MediaBox";
import { styled } from "../../../../../theme";
import { KeywordsBox } from "../../../../KeywordsBox";
import { Box } from "../../../../mui";
import { EventTimelinePlugin } from "./EventTimelinePlugin";

const PREFIX = `inline-relations-box`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    // position: 'sticky',
    padding: 20,
  },
}));

interface InlineRelationsPluginProps {
  relations: InlineRelations;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (g: Keyword.Keyword) => void;
  onMediaClick: (m: Media.Media) => void;
  onEventClick: (m: Events.Event) => void;
}

export const InlineRelationsPlugin: React.FC<InlineRelationsPluginProps> = ({
  relations: { actors, groups, keywords, media, events },
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onMediaClick,
  onEventClick,
}) => {
  return (
    <StyledBox className={classes.root}>
      <ActorsBox
        style={{ display: "flex", flexDirection: "row" }}
        params={{ filter: { ids: actors } }}
        onActorClick={onActorClick}
      />
      <GroupsBox
        params={{ filter: { ids: groups } }}
        onItemClick={onGroupClick}
      />
      <KeywordsBox ids={keywords} onItemClick={onKeywordClick} />
      <EventTimelinePlugin events={events} onEventClick={onEventClick} />
      <MediaBox columns={3} filter={{ ids: media }} onClick={onMediaClick} />
    </StyledBox>
  );
};
