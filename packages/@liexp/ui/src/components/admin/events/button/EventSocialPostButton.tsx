import { fp } from "@liexp/core/lib/fp";
import { getTitle } from "@liexp/shared/lib/helpers/event";
import {
  getEventMetadata,
  getRelationIds,
} from "@liexp/shared/lib/helpers/event/event";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { getTextContents, isValidValue } from "@liexp/shared/lib/slate";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { pipe } from "fp-ts/function";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { fetchRelations } from "../../../../state/queries/SearchEventsQuery";
import {
  type SocialPostButtonProps,
  SocialPostButton,
} from "../../common/SocialPostButton";

export const EventSocialPostButton: React.FC<
  Omit<SocialPostButtonProps, "onLoadSharePayloadClick"> & { id: UUID }
> = ({ id }) => {
  const apiProvider = useDataProvider();
  const record = useRecordContext();

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
                ({
                  actors,
                  groups,
                  keywords,
                  media,
                  groupsMembers,
                  links,
                }) => ({
                  actors: actors.data,
                  keywords: keywords.data,
                  groups: groups.data,
                  media: media.data,
                  groupsMembers: groupsMembers.data,
                  links: links.data,
                  areas: [],
                }),
              ),
              throwTE,
            );

            const title = getTitle(event, relations);

            const searchEvent = toSearchEvent(event, {
              actors: new Map(relations.actors.map((a) => [a.id, a])),
              groups: new Map(relations.groups.map((a) => [a.id, a])),
              media: new Map(relations.media.map((a) => [a.id, a])),
              keywords: new Map(relations.keywords.map((a) => [a.id, a])),
              groupsMembers: new Map(
                relations.groupsMembers.map((a) => [a.id, a]),
              ),
            });

            if (searchEvent.type === "Quote") {
              const { subject } = searchEvent.payload;
              return {
                event: {
                  ...searchEvent,
                },
                actors: subject.type === "Actor" ? [subject.id] : [],
                groups: subject.type === "Group" ? [subject.id] : [],
                media: subject.id.avatar
                  ? pipe(
                      subject.id.avatar.split("."),
                      fp.A.last,
                      fp.O.map((ext) => [
                        {
                          id: uuid(),
                          location: subject.id.avatar,
                          thumbnail: subject.id.avatar,
                          type: contentTypeFromFileExt(ext),
                        },
                      ]),
                      fp.O.getOrElse((): any[] => []),
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
              useReply: false,
              platforms: { TG: true, IG: false },
              schedule: record.schedule,
            };
          });
      }}
    />
  );
};
