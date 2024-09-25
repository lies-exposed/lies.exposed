import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { GroupsBox } from "../../../../../containers/GroupsBox.js";
import { ActorsBox } from "../../../../../containers/actors/ActorsBox/index.js";
import { MediaBox } from "../../../../../containers/media/MediaBox/index.js";
import { styled } from "../../../../../theme/index.js";
import { KeywordsBox } from "../../../../KeywordsBox.js";
import { Box } from "../../../../mui/index.js";
import { type InlineRelations } from "../../utils/transform.utils.js";
import { EventTimelinePlugin } from "./EventTimelinePlugin.js";

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
  onEventClick: (m: SearchEvent) => void;
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
