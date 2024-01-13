import { fp } from "@liexp/core/lib/fp";
import * as A from "fp-ts/Array";
import * as M from "fp-ts/Map";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import {
  Events,
  type Actor,
  type Area,
  type Group,
  type GroupMember,
  type Keyword,
  type Link,
  type Media,
} from "../../io/http";
import { type BySubject } from "../../io/http/Common";
import { type EventTotals } from "../../io/http/Events/EventTotals";
import { BySubjectUtils } from "../../io/utils/BySubjectUtils";
import { eventRelationIdsMonoid } from "./event";
import { getRelationIds } from "./getEventRelationIds";

export interface SearchEventsQueryCache {
  events: Events.SearchEvent.SearchEvent[];
  actors: Map<string, Actor.Actor>;
  groups: Map<string, Group.Group>;
  groupsMembers: Map<string, GroupMember.GroupMember>;
  media: Map<string, Media.Media>;
  keywords: Map<string, Keyword.Keyword>;
  links: Map<string, Link.Link>;
  areas: Map<string, Area.Area>;
}

export const getNewRelationIds = (
  events: Events.Event[],
  s: SearchEventsQueryCache,
): Events.EventRelationIds => {
  // get relation ids from cache;

  const actorIds = pipe(s.actors, M.keys(S.Ord));
  const groupIds = pipe(s.groups, M.keys(S.Ord));
  const groupsMemberIds = pipe(s.groupsMembers, M.keys(S.Ord));
  const mediaIds = pipe(s.media, M.keys(S.Ord));
  const keywordIds = pipe(s.keywords, M.keys(S.Ord));
  const linkIds = pipe(s.links, M.keys(S.Ord));
  const areaIds = pipe(s.areas, M.keys(S.Ord));

  const init: Events.EventRelationIds = eventRelationIdsMonoid.empty;

  return pipe(
    events,
    A.reduce(init, (acc, e) => {
      const { actors, groups, groupsMembers, media, keywords, links, areas } =
        getRelationIds(e);

      const newActors = actors.filter(
        (a) => ![...actorIds, ...acc.actors].includes(a),
      );

      const newGroups = groups.filter(
        (a) => ![...groupIds, ...acc.groups].includes(a),
      );
      const newGroupsMembers = groupsMembers.filter(
        (g) => ![...groupsMemberIds, ...acc.groupsMembers].includes(g),
      );
      const newMediaIds = media.filter(
        (m) => ![...acc.media, ...mediaIds].includes(m),
      );
      const newKeywordIds = keywords.filter(
        (k) => ![...keywordIds, ...acc.keywords].includes(k),
      );

      const newLinkIds = links.filter(
        (k) => ![...linkIds, ...acc.links].includes(k),
      );

      const newAreaIds = areas.filter(
        (k) => ![...areaIds, ...acc.areas].includes(k),
      );

      return {
        actors: acc.actors.concat(newActors),
        groups: acc.groups.concat(newGroups),
        groupsMembers: acc.groupsMembers.concat(newGroupsMembers),
        media: acc.media.concat(newMediaIds),
        keywords: acc.keywords.concat(newKeywordIds),
        links: acc.links.concat(newLinkIds),
        areas: acc.areas.concat(newAreaIds),
        socialPosts: [],
      };
    }),
  );
};

export const updateCache = (
  s: SearchEventsQueryCache,
  update: Events.EventRelations & {
    events: { data: Events.Event[]; total: number; totals: EventTotals };
  },
): SearchEventsQueryCache => {
  const actors = pipe(
    update.actors,
    A.reduce(s.actors, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    }),
  );

  const groups = pipe(
    update.groups,
    A.reduce(s.groups, (accGroups, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accGroups);
    }),
  );

  const groupsMembers = pipe(
    update.groupsMembers,
    A.reduce(s.groupsMembers, (accGroupsMembers, gm) => {
      return M.upsertAt(S.Eq)(gm.id, gm)(accGroupsMembers);
    }),
  );

  const media = pipe(
    update.media,
    A.reduce(s.media, (accMedia, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accMedia);
    }),
  );

  const keywords = pipe(
    update.keywords,
    A.reduce(s.keywords, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    }),
  );

  const links = pipe(
    update.links,
    A.reduce(s.links, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    }),
  );

  const newEvents = pipe(
    update.events.data,
    A.map((e) =>
      toSearchEvent(e, {
        actors,
        groups,
        groupsMembers,
        media,
        keywords,
        links,
      }),
    ),
  );

  const areas = new Map();

  return {
    events: newEvents,
    actors,
    groups,
    groupsMembers,
    media,
    keywords,
    links,
    areas,
  };
};

export const toSearchEvent = (
  e: Events.Event,
  s: Partial<Omit<SearchEventsQueryCache, "events">>,
): Events.SearchEvent.SearchEvent => {
  const {
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    media: mediaIds,
    keywords: keywordIds,
    links: linkIds,
  } = getRelationIds(e);

  const actors = pipe(
    actorIds,
    A.map((a) =>
      pipe(s.actors ?? new Map<string, Actor.Actor>(), M.lookup(S.Eq)(a)),
    ),
    A.compact,
  );

  const groups = pipe(
    groupIds,
    A.map((a) =>
      pipe(s.groups ?? new Map<string, Group.Group>(), M.lookup(S.Eq)(a)),
    ),
    A.compact,
  );

  const groupsMembers = pipe(
    groupsMembersIds,
    A.map((a) =>
      pipe(
        s.groupsMembers ?? new Map<string, GroupMember.GroupMember>(),
        M.lookup(S.Eq)(a),
      ),
    ),
    A.compact,
  );

  const media = pipe(
    mediaIds,
    A.map((a) =>
      pipe(s.media ?? new Map<string, Media.Media>(), M.lookup(S.Eq)(a)),
    ),
    A.compact,
  );

  const keywords = pipe(
    keywordIds,
    A.map((a) =>
      pipe(s.keywords ?? new Map<string, Keyword.Keyword>(), M.lookup(S.Eq)(a)),
    ),
    A.compact,
  );

  const links = pipe(
    linkIds,
    A.map((a) => pipe(s.links ?? new Map(), M.lookup(S.Eq)(a))),
    A.compact,
  );

  switch (e.type) {
    case Events.EventTypes.BOOK.value: {
      const authors = BySubjectUtils.toBySubjectArray(
        e.payload.authors,
        actors,
        groups,
      );
      const publisher = pipe(
        e.payload.publisher,
        fp.O.fromNullable,
        fp.O.chain((pub) =>
          BySubjectUtils.lookupForSubject(pub, actors, groups),
        ),
        fp.O.toUndefined,
      );

      const pdfMedia: Media.Media =
        media.find((m) => e.payload.media.pdf === m.id) ?? media[0];
      const audioMedia = media.find((m) => e.payload.media.audio === m.id);
      return {
        ...e,
        payload: {
          ...e.payload,
          authors,
          media: { pdf: pdfMedia, audio: audioMedia },
          publisher,
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.QUOTE.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          subject: actors[0]
            ? {
                type: "Actor",
                id: actors[0],
              }
            : { type: "Group", id: groups[0] },
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.DEATH.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          victim:
            actors.find((a) => a.id === e.payload.victim) ??
            ({
              id: e.payload.victim,
            } as any),
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.SCIENTIFIC_STUDY.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          url: links.find((l) => l.id === e.payload.url) ?? links[0],
          authors: actors,
          publisher: groups[0],
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.PATENT.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          source: links.find((l) => l.id === e.payload.source) ?? links[0],
          owners: { actors, groups },
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.DOCUMENTARY.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          media: media.find((m) => m.id === e.payload.media) ?? media[0],
          website: links.find((l) => l.id === e.payload.website) ?? links[0],
          authors: {
            actors: actors.filter((a) =>
              e.payload.authors.actors.includes(a.id),
            ),
            groups: groups.filter((g) =>
              e.payload.authors.groups.includes(g.id),
            ),
          },
          subjects: {
            actors: actors.filter((a) =>
              e.payload.subjects.actors.includes(a.id),
            ),
            groups: groups.filter((g) =>
              e.payload.subjects.groups.includes(g.id),
            ),
          },
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.TRANSACTION.value: {
      const from: BySubject = pipe(
        BySubjectUtils.lookupForSubject(e.payload.from, actors, groups),
        fp.O.toUndefined,
      ) ?? { type: "Actor", id: actors[0] };

      const to = pipe(
        BySubjectUtils.lookupForSubject(e.payload.to, actors, groups),
        fp.O.toUndefined,
      ) ?? { type: "Actor", id: actors[0] };

      return {
        ...e,
        payload: {
          ...e.payload,
          from,
          to,
        },
        media,
        keywords,
        links,
      };
    }
    default: {
      return {
        ...e,
        payload: {
          ...e.payload,
          actors,
          groups,
          groupsMembers,
        },
        media,
        keywords,
        links,
      };
    }
  }
};
