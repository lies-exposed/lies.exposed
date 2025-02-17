import { type SearchBookEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchBookEvent.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { Button } from "react-admin";
import { SubjectList } from "../../lists/SubjectsList.js";
import {
  Card,
  CardActionArea,
  CardActions,
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
  defaultImage,
  showRelations,
  showMedia,
  ...rest
}) => {
  const media = event.media?.[0]?.thumbnail;

  return (
    <Card {...rest}>
      {media && (
        <CardMedia
          component="img"
          image={media}
          style={{ height: "100%", maxHeight: 200 }}
        />
      )}
      <Stack direction="column" style={{ flexGrow: 2 }}>
        <CardHeader
          title={event.payload.title}
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
            direction={"row"}
            justifyItems={"center"}
            spacing={1}
            style={{ width: "100%" }}
          >
            <Stack flex={1}>
              <Typography>{formatDate(event.date)}</Typography>
            </Stack>
            <Stack direction={"column"} justifyContent={"flex-end"} flex={1}>
              <SubjectList
                subjects={event.payload.authors.map((a) => ({
                  ...a,
                  selected: true,
                }))}
                onSubjectClick={() => {}}
              />
            </Stack>
          </Stack>
        </CardContent>
        <CardActionArea style={{ height: 40 }}>
          <CardActions>
            <Button
              label="Open"
              variant="contained"
              size="small"
              onClick={() => {
                onEventClick?.(event);
              }}
            />
          </CardActions>
        </CardActionArea>
      </Stack>
    </Card>
  );
};
