import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { Stack } from "@mui/system";
import { parseISO } from "date-fns";
import * as React from "react";
import { BNEditor } from "../../Common/BlockNote/index.js";
import { isValidValue } from "../../Common/BlockNote/utils/isValidValue.js";
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
  showMedia?: boolean;
  layout?: "vertical" | "horizontal";
  onEventClick?: (e: Events.Event) => void;
}

const EventSlimCard: React.FC<EventSlimCardProps> = ({
  event,
  showMedia = true,
  onEventClick,
  defaultImage,
  layout = "vertical",
  ...props
}) => {
  // const { media } = getRelationIds(event);
  const title = getTitle(event, {
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
                image={defaultImage}
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
                  <BNEditor content={event.excerpt} readOnly />
                </Box>
              ) : null}
            </CardContent>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

export default EventSlimCard;
