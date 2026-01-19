import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { Stack } from "@mui/system";
import { parseISO } from "date-fns";
import * as React from "react";
import { BNEditor } from "../../Common/BlockNote/index.js";
import { EventIcon } from "../../Common/Icons/index.js";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  type CardProps,
} from "../../mui/index.js";

export interface EventSlimCardProps extends CardProps {
  event: Events.Event;
  defaultImage: string;
  /** Optional image URL to display. If not provided, falls back to defaultImage. */
  image?: string;
  showMedia?: boolean;
  showExcerpt?: boolean;
  layout?: "vertical" | "horizontal";
  onEventClick?: (e: Events.Event) => void;
}

const EventSlimCard: React.FC<EventSlimCardProps> = ({
  event,
  showMedia = true,
  showExcerpt = true,
  onEventClick,
  defaultImage,
  image,
  layout = "vertical",
  ...props
}) => {
  const displayImage = image ?? defaultImage;
  const title = EventHelper.getTitle(event, {
    actors: [],
    groups: [],
    media: [],
    keywords: [],
    groupsMembers: [],
    areas: [],
    links: [],
  });

  const date =
    typeof event.date === "string" ? parseISO(event.date as any) : event.date;

  const handleClick = onEventClick
    ? () => {
        onEventClick(event);
      }
    : undefined;

  const isVertical = layout === "vertical";
  return (
    <Card onClick={handleClick} {...props}>
      <CardActionArea>
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
                image={displayImage}
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
            {showExcerpt ? (
              <CardContent>
                {isValidValue(event.excerpt) ? (
                  <Box
                    style={{
                      maxHeight: 100,
                      overflow: "hidden",
                    }}
                  >
                    <BNEditor content={event.excerpt} readOnly />
                  </Box>
                ) : null}
              </CardContent>
            ) : null}
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default EventSlimCard;
