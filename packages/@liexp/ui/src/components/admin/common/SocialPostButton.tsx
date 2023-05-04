import { fp } from "@liexp/core/lib/fp";
import { getShareMedia, getTitle } from "@liexp/shared/lib/helpers/event";
import {
  getEventMetadata,
  getRelationIds,
} from "@liexp/shared/lib/helpers/event/event";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type Keyword, type Media } from "@liexp/shared/lib/io/http";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { type ShareMessageBody } from "@liexp/shared/lib/io/http/ShareMessage";
import { getTextContents, isValidValue } from "@liexp/shared/lib/slate";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import {
  contentTypeFromFileExt
} from "@liexp/shared/lib/utils/media.utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { pipe } from "fp-ts/lib/function";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  type FieldProps,
  type Identifier,
} from "react-admin";
import { fetchRelations } from "../../../state/queries/SearchEventsQuery";
import { Box, Button, CircularProgress } from "../../mui";
import { ShareModal, emptySharePayload } from "../Modal/ShareModal";

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
          .getOne<Event>(`events`, { id })
          .then(async ({ data: event }) => {
            const relationIds = getRelationIds(event);
            const relations = await pipe(
              fetchRelations(relationIds),
              fp.TE.map(
                ({ actors, groups, keywords, media, groupsMembers }) => ({
                  actors: actors.data,
                  keywords: keywords.data,
                  groups: groups.data,
                  media: media.data,
                  groupsMembers: groupsMembers.data,
                })
              ),
              throwTE
            );

            const title = getTitle(event, relations);

            const searchEvent = toSearchEvent(event, {
              actors: new Map(relations.actors.map((a) => [a.id, a])),
              groups: new Map(relations.groups.map((a) => [a.id, a])),
              media: new Map(relations.media.map((a) => [a.id, a])),
              keywords: new Map(relations.keywords.map((a) => [a.id, a])),
              groupsMembers: new Map(
                relations.groupsMembers.map((a) => [a.id, a])
              ),
            });

            if (searchEvent.type === "Quote") {
              const { actor } = searchEvent.payload;
              return {
                event: {
                  ...searchEvent,
                },
                actors: [actor],
                groups: relations.groups,
                media: actor.avatar
                  ? pipe(
                      actor.avatar.split("."),
                      fp.A.last,
                      fp.O.map((ext) => [
                        {
                          id: uuid(),
                          location: actor.avatar,
                          thumbnail: actor.avatar,
                          type: contentTypeFromFileExt(ext),
                        },
                      ]),
                      fp.O.getOrElse((): any[] => [])
                    )
                  : relations.media,
                title,
              };
            }

            const { media, actors, groups } = getEventMetadata(searchEvent);
            return {
              event: {
                ...event,
                ...searchEvent,
                media,
              },
              media,
              actors,
              groups,
              title,
            };
          })
          .then(({ event, actors, groups, media, title }) => {
            const { date, excerpt, keywords } = event;

            const content: string = isValidValue(excerpt)
              ? getTextContents(excerpt)
              : "";
            const url = `${process.env.WEB_URL}/events/${id}`;

            return {
              title,
              date: formatDate(parseISO(date as any)),
              media,
              content,
              url,
              keywords,
              actors,
              groups,
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
          actors: [],
          groups: [],
          url,
          platforms: { TG: true, IG: false },
        };
      }}
    />
  );
};
