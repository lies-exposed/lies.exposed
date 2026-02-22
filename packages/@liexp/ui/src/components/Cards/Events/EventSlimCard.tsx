import { type Events } from "@liexp/io/lib/http/index.js";
import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { Stack } from "@mui/system";
import { parseISO } from "date-fns";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
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
import * as styles from "./EventSlimCard.styles.js";

export interface EventSlimCardProps extends CardProps {
  event: Events.Event;
  defaultImage?: string;
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
  defaultImage: _defaultImage,
  image,
  layout = "vertical",
  ...props
}) => {
  const conf = useConfiguration();

  const displayImage =
    image ?? _defaultImage ?? conf.platforms.web.defaultImage;

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
    <Card sx={styles.cardSx} onClick={handleClick} {...props}>
      <CardActionArea>
        <Stack sx={styles.getStackSx(isVertical)}>
          {showMedia ? (
            <Stack sx={styles.getMediaWrapperSx(isVertical)}>
              <CardMedia
                component="img"
                image={displayImage}
                sx={styles.getMediaImageSx(
                  isVertical,
                  props.style?.maxHeight as number,
                )}
              />
            </Stack>
          ) : null}
          <Stack sx={styles.headerStackSx}>
            <CardHeader
              avatar={<EventIcon size="2x" type={event.type} />}
              title={title}
              subheader={formatDate(date)}
            />
            {showExcerpt ? (
              <CardContent>
                {isValidValue(event.excerpt) ? (
                  <Box sx={styles.excerptContainerSx}>
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
