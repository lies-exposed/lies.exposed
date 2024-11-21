import { fp } from "@liexp/core/lib/fp/index.js";
import { TupleWithId } from "@liexp/core/lib/fp/utils/TupleWithId.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { type UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import { useDataProvider, useRecordContext } from "react-admin";
import { useConfiguration } from "../../../../context/ConfigurationContext.js";
import { useAPI } from "../../../../hooks/useAPI.js";
import { fetchRelations } from "../../../../state/queries/SearchEventsQuery.js";
import { SocialPostButton } from "../../common/SocialPostButton.js";

export const EventSocialPostButton: React.FC<{ id: UUID }> = ({ id }) => {
  const apiProvider = useDataProvider();
  const api = useAPI();
  const record = useRecordContext();
  const conf = useConfiguration();

  return (
    <SocialPostButton
      type="events"
      onLoadSharePayloadClick={async ({ multipleMedia }) => {
        return apiProvider
          .getOne<Event>(`events`, { id })
          .then(async ({ data: event }) => {
            const relationIds = getRelationIds(event);
            const relations = await pipe(
              fetchRelations(api)(relationIds),
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
              actors: new Map(relations.actors.map(TupleWithId.of)),
              groups: new Map(relations.groups.map(TupleWithId.of)),
              media: new Map(relations.media.map(TupleWithId.of)),
              keywords: new Map(relations.keywords.map(TupleWithId.of)),
              groupsMembers: new Map(
                relations.groupsMembers.map(TupleWithId.of),
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
                      subject.id.avatar.location.split("."),
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

            const { media, actors, groups } =
              getSearchEventRelations(searchEvent);

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
            const url = `${conf.platforms.web.url}/events/${id}`;

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
              schedule: record?.schedule,
            };
          });
      }}
    />
  );
};
