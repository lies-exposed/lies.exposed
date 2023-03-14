import { getShareMedia, getTitle } from "@liexp/shared/helpers/event";
import { type Keyword } from "@liexp/shared/io/http";
import { MediaType } from "@liexp/shared/io/http/Media";
import { type ShareMessageBody } from "@liexp/shared/io/http/ShareMessage";
import { getTextContents } from "@liexp/shared/slate";
import { formatDate, parseISO } from "@liexp/shared/utils/date";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import {
  type FieldProps,
  type Identifier,
  useDataProvider,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  Link,
  Typography,
} from "../../mui";

const emptySharePayload = {
  title: undefined,
  date: undefined,
  media: undefined,
  content: undefined,
  url: undefined,
  keywords: [],
};

interface TGPostButtonProps extends FieldProps {
  id?: Identifier;
  onLoadSharePayloadClick: () => Promise<ShareMessageBody>;
}

export const TGPostButton: React.FC<TGPostButtonProps> = ({
  onLoadSharePayloadClick,
}) => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();
  const [sharePayload, setSharePayload] =
    React.useState<Partial<ShareMessageBody>>(emptySharePayload);

  return (
    <Box style={{ display: "flex", marginRight: 10 }}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          void onLoadSharePayloadClick().then((result) => {
            setSharePayload(result);
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
                {(sharePayload?.keywords ?? []).map((k: any) => (
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
                .create(`/admins/share/${record?.id}`, {
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

export const EventTGPostButton: React.FC<
  Omit<TGPostButtonProps, "onLoadSharePayloadClick"> & { id: UUID }
> = ({ id }) => {
  const apiProvider = useDataProvider();

  return (
    <TGPostButton
      onLoadSharePayloadClick={async () => {
        return await apiProvider
          .getOne(`events`, { id })
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
              const { data: keywords } = await apiProvider.getMany("keywords", {
                ids: event.keywords,
              });
              return { ...event, keywords };
            }
          })
          .then(async (event) => {
            if (event.type === "Quote") {
              const { data: actor } = await apiProvider.getOne("actors", {
                id: event.payload.actor,
              });

              return {
                event: {
                  ...event,
                  payload: {
                    ...event.payload,
                    actor: actor.fullName,
                  },
                  media: [
                    {
                      type: MediaType.types[0].value,
                      thumbnail: actor.avatar,
                    },
                  ],
                },
                actors: [actor],
              };
            } else if (event.type === "Death") {
              const { data: actor } = await apiProvider.getOne("actors", {
                id: event.payload.victim,
              });
              return {
                event: {
                  ...event,
                  payload: {
                    ...event.payload,
                    victim: actor.fullName,
                  },
                  media: [
                    {
                      type: MediaType.types[0].value,
                      thumbnail: actor.avatar,
                    },
                  ],
                },
                actors: [actor],
              };
            }
            return { event, actors: [] };
          })
          .then(({ event, actors }) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const title = getTitle(event as any, {
              actors,
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
            const content: string = getTextContents(event.excerpt)[0];
            const url = `${process.env.WEB_URL}/events/${id}`;
            const keywords: Keyword.Keyword[] = event.keywords;

            return {
              title,
              date,
              media,
              content,
              url,
              keywords,
            };
          });
      }}
    />
  );
};

export const MediaTGPostButton: React.FC<
  Omit<TGPostButtonProps, "onLoadSharePayloadClick">
> = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <TGPostButton
      onLoadSharePayloadClick={async () => {
        const url = `${process.env.WEB_URL}/media/${record.id}`;

        const keywords: Keyword.Keyword[] =
          record.keywords.length > 0
            ? await apiProvider
                .getList("keywords", {
                  filter: { ids: record.keywords },
                  pagination: { perPage: record.keywords.length, page: 1 },
                  sort: { order: "ASC", field: "createdAt" },
                })
                .then((data) => data.data)
            : await Promise.resolve([]);
        return {
          title: record.description,
          keywords,
          media: record.thumbnail,
          date: record.createdAt,
          content: record.description,
          url,
        };
      }}
    />
  );
};
