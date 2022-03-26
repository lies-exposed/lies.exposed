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
  Typography,
} from "@material-ui/core";
import { FieldProps } from "ra-ui-materialui";
import * as React from "react";
import { apiProvider } from "@client/HTTPAPI";

interface TGPostButtonProps extends FieldProps {
  id?: string;
}

const emptySharePayload = {
  title: undefined,
  media: undefined,
  content: undefined,
  url: undefined,
};

export const TGPostButton: React.FC<TGPostButtonProps> = (props) => {
  const { id } = props;
  const [sharePayload, setSharePayload] = React.useState(emptySharePayload);

  return (
    <Box style={{ display: "flex" }}>
      <Button
        color="secondary"
        variant="contained"
        onClick={() => {
          void apiProvider
            .getOne(`events`, { id })
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
              const title = getTitle(event as any);

              const media = getShareMedia(
                event.media,
                `${process.env.WEB_URL}/liexp-logo-1200x630.png`
              );
              const content = getTextContentsCapped(event.excerpt, 100);
              const url = `${process.env.WEB_URL}/events/${id}`;
              setSharePayload({
                title,
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
          {sharePayload ? (
            <Box style={{ width: "100%" }}>
              <Typography>{sharePayload.title}</Typography>
              <img src={sharePayload.media} style={{ width: "100%" }} />
              <Typography>{sharePayload.content}</Typography>
              <Link href={sharePayload.url}>{sharePayload.url}</Link>
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
                .create(`/events/${id}/share`, {
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
