import { type Actor, Events, type Keyword } from "@liexp/shared/io/http";
import * as React from "react";
import { Box } from "../../mui";
import EventListItemBase from "./EventListItemBase";

interface PatentListItemProps {
  item: Events.SearchEvent.SearchPatentEvent;
  onClick?: (e: Events.SearchEvent.SearchPatentEvent) => void;
  onActorClick?: (e: Actor.Actor) => void;
  onKeywordClick?: (e: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchPatentEvent) => void;
  onLoad?: () => void;
}

const PatentListItem: React.FC<PatentListItemProps> = ({
  item,
  onClick,
  onActorClick,
  ...props
}) => {
  // const victim = actors.find((a) => a.id === item.payload.victim);

  return (
    <Box
      key={item.id}
      id={item.id}
      style={{
        width: "100%",
      }}
      onClick={() => onClick?.(item)}
    >
      <EventListItemBase
        {...props}
        event={item}
        type={Events.Patent.PATENT.value}
        title={item.payload.title}
        url={item.payload.source}
        excerpt={item.excerpt}
        keywords={item.keywords}
        media={item.media}
        links={item.links}
      />
    </Box>
  );
};

export default PatentListItem;
