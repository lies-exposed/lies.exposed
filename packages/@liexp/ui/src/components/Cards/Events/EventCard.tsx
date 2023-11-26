import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations";
import { Events } from "@liexp/shared/lib/io/http";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events";
import { formatDate } from "@liexp/shared/lib/utils/date";
import { parseISO } from "date-fns";
import * as React from "react";
import { LazyEditor as Editor } from "../../Common/Editor";
import { EventIcon } from "../../Common/Icons";
import { ActorList } from "../../lists/ActorList";
import GroupsList from "../../lists/GroupList";
import KeywordList from "../../lists/KeywordList";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  type CardProps,
} from "../../mui";

const defaultImage = "/liexp-logo-1200x630.png";

interface EventCardProps extends CardProps {
  event: SearchEvent.SearchEvent;
  showMedia?: boolean;
  showRelations: boolean;
  onEventClick?: (e: SearchEvent.SearchEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showMedia = true,
  showRelations,
  onEventClick,
  ...props
}) => {
  const { actors, groups, media, keywords } = getSearchEventRelations(event);
  const title = getTitleForSearchEvent(event);

  const image =
    event.type === Events.EventTypes.DEATH.value
      ? event.payload.victim?.avatar
      : media[0]?.thumbnail ?? defaultImage;

  const date =
    typeof event.date === "string" ? parseISO(event.date as any) : event.date;

  const handleClick = onEventClick
    ? () => {
        onEventClick(event);
      }
    : undefined;
  return (
    <Card onClick={handleClick} {...props}>
      <CardActionArea>
        {showMedia ? (
          <CardMedia component="img" image={image} style={{ height: 200 }} />
        ) : null}
        <CardHeader
          avatar={<EventIcon size="2x" type={event.type} />}
          title={title}
          subheader={formatDate(date)}
        />

        <CardContent>
          {event.excerpt ? (
            <Box
              style={{
                maxHeight: 100,
                overflow: "hidden",
              }}
            >
              <React.Suspense>
                <Editor value={event.excerpt as any} readOnly />
              </React.Suspense>
            </Box>
          ) : null}

          {showRelations ? (
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
              }}
            >
              <ActorList
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
                actors={actors.map((a) => ({ ...a, selected: true }))}
                onActorClick={() => {}}
              />
              <GroupsList
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
                groups={groups.map((g) => ({ ...g, selected: true }))}
                onItemClick={() => undefined}
              />
              <KeywordList
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
                keywords={keywords.map((k) => ({ ...k, selected: true }))}
                onItemClick={() => undefined}
              />
            </Box>
          ) : null}
        </CardContent>
      </CardActionArea>
      {/* <CardActions disableSpacing></CardActions> */}
    </Card>
  );
};

export default EventCard;
