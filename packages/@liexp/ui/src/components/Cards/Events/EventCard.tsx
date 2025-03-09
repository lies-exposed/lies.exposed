import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/index.js";
import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { Stack } from "@mui/system";
import { parseISO } from "date-fns";
import * as React from "react";
import EllipsesContent from "../../Common/EllipsedContent.js";
import { EventIcon } from "../../Common/Icons/index.js";
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

export interface EventCardProps<E extends SearchEvent.SearchEvent>
  extends CardProps {
  event: E;
  defaultImage?: string;
  showMedia?: boolean;
  showRelations: boolean;
  layout?: "vertical" | "horizontal";
  onEventClick?: (e: E) => void;
}

const EventCard = <E extends SearchEvent.SearchEvent>({
  event,
  showMedia = true,
  showRelations,
  onEventClick,
  defaultImage,
  layout = "vertical",
  ...props
}: EventCardProps<E>): React.JSX.Element => {
  const { actors, groups, media, keywords } = getSearchEventRelations(event);
  const title = getTitleForSearchEvent(event);

  const defaultMedia = media[0]?.thumbnail ?? defaultImage;
  const _image =
    event.type === Events.EventTypes.DEATH.value
      ? event.payload.victim?.avatar?.thumbnail
      : event.type === Events.EventTypes.QUOTE.value
        ? (event.payload.subject.id.avatar?.thumbnail ?? defaultMedia)
        : defaultMedia;

  const image = _image ?? defaultMedia;

  const date =
    typeof event.date === "string" ? parseISO(event.date as any) : event.date;

  const handleClick = () => {
    onEventClick?.(event);
  };
  const isVertical = layout === "vertical";
  return (
    <Card {...props}>
      <CardActionArea onClick={handleClick}>
        <Stack
          direction={isVertical ? "column" : "row"}
          alignItems={"flex-start"}
          width={"100%"}
        >
          {showMedia ? (
            <Stack
              display="flex"
              width={isVertical ? "100%" : "150px"}
              direction={"row"}
            >
              <CardMedia
                component="img"
                image={image}
                style={{
                  height: props.style?.maxHeight ?? 150,
                  width: isVertical ? "100%" : 150,
                }}
              />
            </Stack>
          ) : null}
          <Stack direction={"column"}>
            <CardHeader
              avatar={<EventIcon size="2x" type={event.type} />}
              title={title}
              subheader={formatDate(date)}
            />

            <CardContent>
              {isValidValue(event.excerpt) ? (
                <Box
                  style={{
                    maxHeight: 100,
                    overflow: "hidden",
                  }}
                >
                  <EllipsesContent
                    text={getTextContents(event.excerpt)}
                    maxLine={3}
                  />
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
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default EventCard;
