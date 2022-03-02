import { Actor, Keyword } from "@liexp/shared/io/http";
import { Box } from "@material-ui/core";
import * as React from "react";
import { SearchPatentEvent } from "./EventListItem";
import EventListItemBase from './EventListItemBase';

interface PatentListItemProps {
  item: SearchPatentEvent;
  onClick?: (e: SearchPatentEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
}

const PatentListItem: React.FC<PatentListItemProps> = ({
  item,
  onClick,
  onActorClick,
  onKeywordClick,
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
        marginBottom: 40,
      }}
      onClick={() => onClick?.(item)}
    >
      <EventListItemBase
        title={item.payload.title}
        url={item.payload.source}
        excerpt={item.excerpt}
        keywords={item.keywords}
        media={item.media}
        links={item.links}
        onKeywordClick={onKeywordClick}
      />
    </Box>
  );
};

export default PatentListItem;
