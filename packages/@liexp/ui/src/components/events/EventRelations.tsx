import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as React from "react";
import QueriesRenderer from "../QueriesRenderer.js";

export const EventRelations: React.FC<{
  event: Event;
  children: (
    props: Events.EventRelations & {
      event: Event;
    },
  ) => React.ReactElement;
}> = ({ event, children }) => {
  const { actors, groups, media, links, groupsMembers } = getRelationIds(event);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        actors: Q.Actor.list.useQuery(
          undefined,
          {
            ids: actors,
            _end: actors.length.toString(),
          },
          true,
        ),
        groups: Q.Group.list.useQuery(
          undefined,
          {
            ids: groups,
            _end: groups.length.toString(),
          },
          true,
        ),
        groupsMembers: Q.GroupMember.list.useQuery(
          undefined,
          {
            ids: groupsMembers,
            _end: groupsMembers.length.toString(),
          },
          true,
        ),
        media: Q.Media.list.useQuery(
          undefined,
          {
            ids: media,
            _end: media.length.toString(),
            _sort: "createdAt",
            _order: "DESC",
          },

          true,
        ),
        links: Q.Link.list.useQuery(
          undefined,
          {
            ids: links,
            _end: links.length.toString(),
            _sort: "createdAt",
            _order: "DESC",
          },
          true,
        ),
        keywords: Q.Keyword.list.useQuery(
          undefined,
          {
            ids: event.keywords,
            _end: event.keywords.length.toString(),
          },
          true,
        ),
        areas: Q.Area.list.useQuery(
          undefined,
          {
            ids: Schema.is(UUID)((event.payload as any).location)
              ? [(event.payload as any).location]
              : [],
            _end: "10",
          },
          true,
        ),
      })}
      render={({
        actors: { data: actors },
        groups: { data: groups },
        media: { data: media },
        areas: { data: areas },
        groupsMembers: { data: groupsMembers },
        links: { data: links },
        keywords: { data: keywords },
      }) => {
        return children({
          actors: [...actors],
          media: [...media],
          event,
          groups: [...groups],
          areas: [...areas],
          groupsMembers: [...groupsMembers],
          links: [...links],
          keywords: [...keywords],
        });
      }}
    />
  );
};
