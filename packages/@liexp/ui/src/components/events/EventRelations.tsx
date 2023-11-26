import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import {
  type Link,
  type Actor,
  type Area,
  type Group,
  type GroupMember,
} from "@liexp/shared/lib/io/http";
import { type Event } from "@liexp/shared/lib/io/http/Events";
import { type Media } from "@liexp/shared/lib/io/http/Media";
import { UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { useGroupMembersQuery } from "../../state/queries/DiscreteQueries";
import { useActorsQuery } from "../../state/queries/actor.queries";
import { useAreasQuery } from "../../state/queries/area.queries";
import { useGroupsQuery } from "../../state/queries/groups.queries";
import { useLinksQuery } from "../../state/queries/link.queries";
import { useMediaQuery } from "../../state/queries/media.queries";
import QueriesRenderer from "../QueriesRenderer";

export const EventRelations: React.FC<{
  event: Event;
  children: (props: {
    actors: Actor.Actor[];
    groups: Group.Group[];
    media: Media[];
    areas: Area.Area[];
    links: Link.Link[];
    event: Event;
    groupsMembers: GroupMember.GroupMember[];
  }) => JSX.Element;
}> = ({ event, children }) => {
  const { actors, groups, media, links, groupsMembers } = getRelationIds(event);
  return (
    <QueriesRenderer
      queries={{
        actors: useActorsQuery(
          {
            filter: { ids: actors },
            pagination: {
              perPage: actors.length,
              page: 1,
            },
          },
          true,
        ),
        groups: useGroupsQuery(
          {
            filter: { ids: groups },
            pagination: {
              perPage: groups.length,
              page: 1,
            },
          },
          true,
        ),
        groupsMembers: useGroupMembersQuery(
          {
            filter: { ids: groupsMembers },
            pagination: {
              perPage: groupsMembers.length,
              page: 1,
            },
          },
          true,
        ),
        media: useMediaQuery(
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
          true,
        ),
        links: useLinksQuery(
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
          true,
        ),
        areas: useAreasQuery(
          {
            filter: UUID.is((event.payload as any).location)
              ? { ids: [(event.payload as any).location] }
              : {},
            pagination: {
              perPage: 1,
              page: 1,
            },
          },
          true,
        ),
      }}
      render={({
        actors: { data: actors },
        groups: { data: groups },
        media: { data: media },
        areas: { data: areas },
        groupsMembers: { data: groupsMembers },
        links: { data: links },
      }) => {
        return children({
          actors,
          media,
          event,
          groups,
          areas,
          groupsMembers,
          links,
        });
      }}
    />
  );
};
