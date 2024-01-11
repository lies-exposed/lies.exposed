import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { type Events } from "@liexp/shared/lib/io/http";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import QueriesRenderer from "../QueriesRenderer";

export const EventRelations: React.FC<{
  event: Event;
  children: (
    props: Events.EventRelations & {
      event: Event;
    },
  ) => JSX.Element;
}> = ({ event, children }) => {
  const { actors, groups, media, links, groupsMembers } = getRelationIds(event);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        actors: Q.Actor.list.useQuery(
          {
            filter: { ids: actors },
            pagination: {
              perPage: actors.length,
              page: 1,
            },
          },
          undefined,
          true,
        ),
        groups: Q.Group.list.useQuery(
          {
            filter: { ids: groups },
            pagination: {
              perPage: groups.length,
              page: 1,
            },
          },
          undefined,
          true,
        ),
        groupsMembers: Q.GroupMember.list.useQuery(
          {
            filter: { ids: groupsMembers },
            pagination: {
              perPage: groupsMembers.length,
              page: 1,
            },
          },
          undefined,
          true,
        ),
        media: Q.Media.list.useQuery(
          {
            filter: { ids: media },
            pagination: {
              perPage: media.length,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
          },
          undefined,
          true,
        ),
        links: Q.Link.list.useQuery(
          {
            filter: { ids: links },
            pagination: {
              perPage: links.length,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
          },
          undefined,
          true,
        ),
        keywords: Q.Keyword.list.useQuery(
          {
            filter: { ids: event.keywords },
            pagination: {
              perPage: event.keywords.length,
              page: 1,
            },
          },
          undefined,
          true,
        ),
        areas: Q.Area.list.useQuery(
          {
            filter: UUID.is((event.payload as any).location)
              ? { ids: [(event.payload as any).location] }
              : {},
            pagination: {
              perPage: 1,
              page: 1,
            },
          },
          undefined,
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
          actors,
          media,
          event,
          groups,
          areas,
          groupsMembers,
          links,
          keywords,
        });
      }}
    />
  );
};
