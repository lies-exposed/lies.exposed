import { getShareMedia, getTitle } from "@liexp/shared/lib/helpers/event";
import { type Keyword, type Media } from "@liexp/shared/lib/io/http";
import { MediaType } from "@liexp/shared/lib/io/http/Media";
import { type ShareMessageBody } from "@liexp/shared/lib/io/http/ShareMessage";
import { getTextContents } from "@liexp/shared/lib/slate";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  type FieldProps,
  type Identifier,
} from "react-admin";
import { Box, Button, CircularProgress } from "../../mui";
import { ShareModal, emptySharePayload } from "../Modal/ShareModal";

// const emptySharePayload: Partial<ShareMessageBody> = {
//   title: undefined,
//   date: undefined,
//   media: undefined,
//   content: undefined,
//   url: undefined,
//   keywords: [],
// };

interface OnLoadSharePayloadClickOpts {
  multipleMedia: boolean;
}
export interface SocialPostButtonProps extends FieldProps {
  id?: Identifier;
  onLoadSharePayloadClick: (
    opts: OnLoadSharePayloadClickOpts
  ) => Promise<Omit<ShareMessageBody, "media"> & { media: Media.Media[] }>;
}

export const SocialPostButton: React.FC<SocialPostButtonProps> = ({
  onLoadSharePayloadClick,
}) => {
  const record = useRecordContext();

  const [{ payload, media, multipleMedia }, setState] = React.useState<{
    payload: ShareMessageBody | undefined;
    multipleMedia: boolean;
    media: Media.Media[];
  }>({ payload: emptySharePayload, multipleMedia: false, media: [] });

  return (
    <Box style={{ display: "flex", marginRight: 10 }}>
      <Button
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          void onLoadSharePayloadClick({ multipleMedia }).then((result) => {
            setState((s) => ({
              ...s,
              media: result.media,
              payload: {
                ...result,
                media: getShareMedia(
                  result.media,
                  `${process.env.WEB_URL}/liexp-logo-1200x630.png`,
                  multipleMedia
                ),
              },
            }));
          });
        }}
      >
        Post on Social
      </Button>
      {payload?.title ? (
        <ShareModal
          id={record.id}
          open={!!payload.title}
          type="events"
          payload={payload}
          media={media}
          multipleMedia={multipleMedia}
          onClose={() => {
            setState({
              media: [],
              multipleMedia: false,
              payload: undefined,
            });
          }}
        />
      ) : null}
    </Box>
  );
};

export const EventSocialPostButton: React.FC<
  Omit<SocialPostButtonProps, "onLoadSharePayloadClick"> & { id: UUID }
> = ({ id }) => {
  const apiProvider = useDataProvider();

  return (
    <SocialPostButton
      onLoadSharePayloadClick={async ({ multipleMedia }) => {
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

            const content: string = getTextContents(event.excerpt)[0];
            const url = `${process.env.WEB_URL}/events/${id}`;
            const keywords: Keyword.Keyword[] = event.keywords;

            return {
              title,
              date,
              media: event.media,
              content,
              url,
              keywords,
              platforms: { TG: true, IG: false },
            };
          });
      }}
    />
  );
};

export const MediaTGPostButton: React.FC<
  Omit<SocialPostButtonProps, "onLoadSharePayloadClick">
> = () => {
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <SocialPostButton
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

        const date = formatDate(parseISO(record.createdAt));

        return {
          title: record.description,
          keywords,
          media: [record as any],
          date,
          content: record.description,
          url,
          platforms: { TG: true, IG: false },
        };
      }}
    />
  );
};
