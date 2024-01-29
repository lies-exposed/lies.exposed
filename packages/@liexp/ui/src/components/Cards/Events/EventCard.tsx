import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/index.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { parseISO } from "date-fns";
import * as React from "react";
import { LazyEditor as Editor } from "../../Common/Editor/index.js";
import { EventIcon } from "../../Common/Icons/index.js";
import { defaultImage } from '../../SEO.js';
import { ActorList } from "../../lists/ActorList.js";
import GroupsList from "../../lists/GroupList.js";
import KeywordList from "../../lists/KeywordList.js";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  type CardProps,
} from "../../mui/index.js";

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
