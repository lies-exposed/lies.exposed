import { type SearchBookEvent } from "@liexp/io/lib/http/Events/SearchEvents/SearchBookEvent.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import EllipsesContent from "../../Common/EllipsedContent.js";
import { SubjectList } from "../../lists/SubjectsList.js";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Stack,
  Typography,
} from "../../mui/index.js";
import { type EventCardProps } from "./EventCard.js";
import {
  cardActionAreaSx,
  authorsColumnSx,
  cardContentSx,
  cardHeaderTitleSx,
  cardSx,
  contentStackSx,
  dateColumnSx,
  excerptContainerSx,
  headerRowSx,
  innerContentStackSx,
  mediaImageSx,
} from "./BookCard.styles.js";

type BookCardProps = EventCardProps<SearchBookEvent>;

export const BookCard: React.FC<BookCardProps> = ({
  event,
  onEventClick,
  defaultImage: _defaultImage,
  showRelations: _showRelations,
  showMedia: _showMedia,
  ...rest
}) => {
  const media = event.media?.[0]?.thumbnail;

  return (
    <Card {...rest} sx={cardSx}>
      <CardActionArea
        onClick={() => onEventClick?.(event)}
        sx={cardActionAreaSx}
      >
        {media && (
          <CardMedia
            component="img"
            image={media}
            sx={mediaImageSx}
          />
        )}
        <Stack sx={contentStackSx}>
          <CardHeader
            title={
              <EllipsesContent
                text={event.payload.title}
                maxLine={2}
                variant="h6"
              />
            }
            slotProps={{
              title: { sx: cardHeaderTitleSx },
            }}
          />
          <CardContent sx={cardContentSx}>
            <Stack sx={innerContentStackSx} spacing={1}>
              <Stack sx={headerRowSx}>
                <Stack sx={dateColumnSx}>
                  <Typography>{formatDate(event.date)}</Typography>
                </Stack>
                <Stack sx={authorsColumnSx}>
                  <SubjectList
                    subjects={event.payload.authors.map((a) => ({
                      ...a,
                      selected: true,
                    }))}
                    onSubjectClick={() => {}}
                  />
                </Stack>
              </Stack>

              {isValidValue(event.excerpt) ? (
                <Stack sx={excerptContainerSx}>
                  <EllipsesContent
                    text={getTextContents(event.excerpt)}
                    maxLine={3}
                  />
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Stack>
      </CardActionArea>
    </Card>
  );
};
