import { formatDate, parseISO } from "@liexp/shared/utils/date";
import { getTextContentsCapped } from "@liexp/ui/components/Common/Editor";
import { getShareMedia, getTitle } from "@liexp/ui/helpers/event.helper";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Typography
} from "@mui/material";
import * as React from "react";
import { FieldProps, Identifier, useRecordContext } from "react-admin";
import { apiProvider } from "@client/HTTPAPI";

interface TGPostButtonProps extends FieldProps {
  id?: Identifier;
}

const emptySharePayload = {
  title: undefined,
  date: undefined,
  media: undefined,
  content: undefined,
  url: undefined,
};

export const TGPostButton: React.FC<TGPostButtonProps> = () => {
  const record = useRecordContext();
  const [sharePayload, setSharePayload] = React.useState(emptySharePayload);

  return (
    <Box style={{ display: "flex" }}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          void apiProvider
            .getOne(`events`, { id: record?.id })
            .then(({ data: event }) => {
              if (event.media.length === 0) {
                return Promise.resolve(event);
              } else {
                return apiProvider
                  .getMany("media", { ids: event.media })
                  .then(({ data: media }) => ({ ...event, media }));
              }
            })
            .then((event) => {
              if (event.type === "Death") {
                return apiProvider
                  .getOne("actors", { id: event.payload.victim })
                  .then(({ data: actor }) => {
                    return {
                      ...event,
                      payload: {
                        ...event.payload,
                        victim: actor.fullName,
                      },
                    };
                  });
              }
              return Promise.resolve(event);
            })
            .then((event) => {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              const title = getTitle(event as any, {
                actors: [],
                groups: [],
                groupsMembers: [],
                keywords: [],
                media: [],
              });

              const date = formatDate(parseISO(event.date));
              const media = getShareMedia(
                event.media,
                `${process.env.WEB_URL}/liexp-logo-1200x630.png`
              );
              const content = getTextContentsCapped(event.excerpt, 100);
              const url = `${process.env.WEB_URL}/events/${record?.id}`;
              setSharePayload({
                title,
                date,
                media,
                content,
                url,
              });
            });
        }}
      >
        Post on TG
      </Button>
      <Dialog open={!!sharePayload.title}>
        <DialogTitle>Post on Telegram</DialogTitle>
        <DialogContent>
          {sharePayload?.date ? (
            <Box style={{ width: "100%" }}>
              <Typography>
                <Link href={sharePayload.url}>{sharePayload.title}</Link>
              </Typography>
              <img src={sharePayload.media} style={{ width: "100%" }} />
              <Typography>
                <Link
                  href={`${process.env.WEB_URL}/events?startDate=${sharePayload.date}`}
                >
                  {sharePayload.date}
                </Link>
                - {sharePayload.content}
              </Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSharePayload(emptySharePayload);
            }}
          >
            Clear
          </Button>
          <Button
            onClick={() => {
              void apiProvider
                .create(`/events/${record?.id}/share`, {
                  data: sharePayload,
                })
                .then((result) => {
                  setSharePayload(emptySharePayload);
                });
            }}
          >
            Post
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
