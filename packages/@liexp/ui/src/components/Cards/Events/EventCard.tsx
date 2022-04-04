import { getEventsMetadata } from "@liexp/shared/helpers/event";
import { Events } from "@liexp/shared/io/http";
import { SearchEvent } from "@liexp/shared/io/http/Events";
import { formatDate } from "@liexp/shared/utils/date";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
} from "@material-ui/core";
import * as React from "react";
import Editor from "../../Common/Editor";
import { EventIcon } from "../../Common/Icons";
import { ActorList } from "../../lists/ActorList";
import GroupsList from "../../lists/GroupList";
import KeywordList from "../../lists/KeywordList";

interface EventCardProps {
  event: SearchEvent.SearchEvent;
  showRelations: boolean;
  onEventClick: (e: SearchEvent.SearchEvent) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  showRelations,
  onEventClick,
}) => {
  const { actors, groups, media, keywords } = getEventsMetadata(event);
  const title =
    event.type === Events.Death.DEATH.value
      ? `Death ${event.payload.victim?.fullName}`
      : event.payload.title;
  const image =
    event.type === Events.Death.DEATH.value
      ? event.payload.victim?.avatar
      : media[0]?.thumbnail;
  return (
    <Box>
      <Card onClick={() => onEventClick(event)}>
        <CardActionArea>
          <CardMedia component="img" image={image} />
          <CardHeader
            avatar={<EventIcon size="2x" type={event.type} />}
            title={title}
            subheader={formatDate(event.date)}
          />

          <CardContent>
            {event.excerpt ? (
              <Box
                style={{
                  maxHeight: 100,
                  overflow: "hidden",
                }}
              >
                <Editor value={event.excerpt as any} readOnly />
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
              </Box>
            ) : null}
            <Box>
              <KeywordList
                keywords={keywords.map((k) => ({ ...k, selected: true }))}
                onItemClick={() => undefined}
              />
            </Box>
          </CardContent>
        </CardActionArea>
        <CardActions disableSpacing></CardActions>
      </Card>
    </Box>
  );
};

export default EventCard;
