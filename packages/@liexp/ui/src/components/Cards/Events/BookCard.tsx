import { type SearchBookEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchBookEvent.js";
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
    <Card {...rest}>
      <CardActionArea
        onClick={() => onEventClick?.(event)}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {media && (
          <CardMedia
            component="img"
            image={media}
            style={{ height: "100%", maxHeight: 200 }}
          />
        )}
        <Stack direction="column" style={{ flexGrow: 2 }}>
          <CardHeader
            title={
              <EllipsesContent
                text={event.payload.title}
                maxLine={2}
                variant="h6"
              />
            }
            slotProps={{
              title: { style: { fontSize: "1rem", marginBottom: 0 } },
            }}
          />
          <CardContent
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              display: "flex",
              flexGrow: 2,
              width: "100%",
            }}
          >
            <Stack
              alignItems="center"
              direction={"column"}
              justifyItems={"center"}
              spacing={1}
              width={"100%"}
            >
              <Stack
                direction={"row"}
                spacing={1}
                alignItems={"center"}
                justifyItems={"space-between"}
                justifyContent={"space-between"}
                width={"100%"}
              >
                <Stack flex={1}>
                  <Typography>{formatDate(event.date)}</Typography>
                </Stack>
                <Stack direction={"row"} justifyContent={"flex-end"} flex={1}>
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
                <Stack>
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
