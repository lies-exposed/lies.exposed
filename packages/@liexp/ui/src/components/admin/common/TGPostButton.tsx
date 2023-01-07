import { getShareMedia, getTitle } from "@liexp/shared/helpers/event";
import { getTextContents } from "@liexp/shared/slate";
import { formatDate, parseISO } from "@liexp/shared/utils/date";
import * as React from "react";
import {
  FieldProps,
  Identifier,
  useDataProvider,
  useRecordContext
} from "react-admin";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle, Input, Link,
  Typography
} from "../../mui";

interface TGPostButtonProps extends FieldProps {
  id?: Identifier;
}

const emptySharePayload = {
  title: undefined,
  date: undefined,
  media: undefined,
  content: undefined,
  url: undefined,
  keywords: [],
};

export const TGPostButton: React.FC<TGPostButtonProps> = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();
  const [sharePayload, setSharePayload] = React.useState<any | undefined>(
    emptySharePayload
  );

  return (
    <Box style={{ display: "flex", marginRight: 10 }}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          void apiProvider
            .getOne(`events`, { id: record?.id })
            .then(async ({ data: event }) => {
              if (event.media.length === 0) {
                return event;
              } else {
                const { data: media } = await apiProvider.getMany("media", {
                  ids: event.media,
                });
                return { ...event, media };
              }
            })
            .then(async (event) => {
              if (event.keywords.length === 0) {
                return event;
              } else {
                const { data: keywords } = await apiProvider.getMany(
                  "keywords",
                  { ids: event.keywords }
                );
                return { ...event, keywords };
              }
            })
            .then(async (event) => {
              if (event.type === "Death") {
                const { data: actor } = await apiProvider.getOne("actors", {
                  id: event.payload.victim,
                });
                return {
                  ...event,
                  payload: {
                    ...event.payload,
                    victim: actor.fullName,
                  },
                };
              }
              return event;
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
              const content = getTextContents(event.excerpt);
              const url = `${process.env.WEB_URL}/events/${record?.id}`;
              const keywords = event.keywords;

              setSharePayload({
                title,
                date,
                media,
                content,
                url,
                keywords,
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
              <br />
              <img src={sharePayload.media} style={{ width: "100%" }} />
              <Typography>
                <Link
                  href={`${process.env.WEB_URL}/events?startDate=${sharePayload.date}`}
                >
                  {sharePayload.date}
                </Link>
                -
                <Box>
                  <Input
                    fullWidth
                    multiline
                    name="content"
                    defaultValue={sharePayload.content ?? ""}
                    value={sharePayload.content ?? ""}
                    onChange={(e) => {
                      setSharePayload({
                        ...sharePayload,
                        content: e.target.value,
                      });
                    }}
                  />
                </Box>
              </Typography>
              <>
                {sharePayload.keywords.map((k: any) => (
                  <a
                    key={k.id}
                    href={`${process.env.WEB_URL}/events?keywords[]=${k.id}`}
                    style={{ marginRight: 10 }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    #{k.tag}
                  </a>
                ))}
              </>
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
