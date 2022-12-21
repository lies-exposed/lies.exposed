import { getRelationIds } from "@liexp/shared/helpers/event";
import { Actor, Area, Group, GroupMember } from "@liexp/shared/io/http";
import { Event } from "@liexp/shared/io/http/Events";
import { Media } from "@liexp/shared/io/http/Media";
import { UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import {
  useActorsQuery,
  useAreasQuery,
  useGroupMembersQuery,
  useGroupsQuery,
  useMediaQuery,
} from "../../state/queries/DiscreteQueries";
import QueriesRenderer from "../QueriesRenderer";

export const EventRelations: React.FC<{
  event: Event;
  children: (props: {
    actors: Actor.Actor[];
    groups: Group.Group[];
    media: Media[];
    areas: Area.Area[];
    event: Event;
    groupsMembers: GroupMember.GroupMember[];
  }) => JSX.Element;
}> = ({ event, children }) => {
  const { actors, groups, media, groupsMembers } = getRelationIds(event);
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
          true
        ),
        groups: useGroupsQuery(
          {
            filter: { ids: groups },
            pagination: {
              perPage: groups.length,
              page: 1,
            },
          },
          true
        ),
        groupsMembers: useGroupMembersQuery(
          {
            filter: { ids: groupsMembers },
            pagination: {
              perPage: groupsMembers.length,
              page: 1,
            },
          },
          true
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
          true
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
          true
        ),
      }}
      render={({
        actors: { data: actors },
        groups: { data: groups },
        media: { data: media },
        areas: { data: areas },
        groupsMembers: { data: groupsMembers },
      }) => {
        return children({ actors, media, event, groups, areas, groupsMembers });
      }}
    />
  );
};
