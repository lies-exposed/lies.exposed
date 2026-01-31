import { type Event } from "@liexp/io/lib/http/Events/index.js";
import { type Events } from "@liexp/io/lib/http/index.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { skipQueryIfEmpty } from "../../utils/query.utils.js";
import QueriesRenderer from "../QueriesRenderer.js";

export const EventRelations: React.FC<{
  event: Event;
  children: (
    props: Events.EventRelations & {
      event: Event;
    },
  ) => React.ReactElement;
}> = ({ event, children }) => {
  const { actors, groups, keywords, media, links, areas, groupsMembers } =
    getRelationIds(event);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        actors: pipe(
          Q.Actor.list.useQuery(
            undefined,
            { ids: actors, _end: actors.length.toString() },
            true,
          ),
          skipQueryIfEmpty(actors),
        ),
        groups: pipe(
          Q.Group.list.useQuery(
            undefined,
            { ids: groups, _end: groups.length.toString() },
            true,
          ),
          skipQueryIfEmpty(groups),
        ),
        groupsMembers: pipe(
          Q.GroupMember.list.useQuery(
            undefined,
            { ids: groupsMembers, _end: groupsMembers.length.toString() },
            true,
          ),
          skipQueryIfEmpty(groupsMembers),
        ),
        media: pipe(
          Q.Media.list.useQuery(
            undefined,
            {
              ids: media,
              _end: media.length.toString(),
              _sort: "createdAt",
              _order: "DESC",
            },
            true,
          ),
          skipQueryIfEmpty(media),
        ),
        links: pipe(
          Q.Link.list.useQuery(
            undefined,
            {
              ids: links,
              _end: links.length.toString(),
              _sort: "createdAt",
              _order: "DESC",
            },
            true,
          ),
          skipQueryIfEmpty(links),
        ),
        keywords: pipe(
          Q.Keyword.list.useQuery(
            undefined,
            {
              ids: keywords,
              _end: keywords.length.toString(),
            },
            true,
          ),
          skipQueryIfEmpty(keywords),
        ),
        areas: pipe(
          Q.Area.list.useQuery(undefined, { ids: areas, _end: "10" }, true),
          skipQueryIfEmpty(areas),
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
