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
import { EventIcon } from "../../Common/Icons";
import { ActorList } from "../../lists/ActorList";
import GroupsList from "../../lists/GroupList";
import KeywordList from "../../lists/KeywordList";

interface EventCardProps {
  event: SearchEvent.SearchEvent;
  showRelations: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showRelations }) => {
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
      <Card>
        <CardActionArea>
          <CardMedia component="img" image={image} />
          <CardHeader
            avatar={<EventIcon type={event.type} />}
            title={title}
            subheader={formatDate(event.date)}
          />
          {showRelations ? (
            <CardContent>
              <ActorList
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
                actors={actors.map((a) => ({ ...a, selected: true }))}
                onActorClick={() => {}}
              />
              <GroupsList
                groups={groups.map((g) => ({ ...g, selected: true }))}
                onItemClick={() => undefined}
              />
            </CardContent>
          ) : null}
        </CardActionArea>
        <CardActions disableSpacing>
          <KeywordList
            keywords={keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={() => undefined}
          />
        </CardActions>
      </Card>
    </Box>
  );
};

export default EventCard;
