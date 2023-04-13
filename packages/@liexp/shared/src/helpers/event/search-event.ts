import * as A from "fp-ts/Array";
import * as M from "fp-ts/Map";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import {
  type Actor,
  Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Media,
} from "../../io/http";
import { type EventTotals } from "../../io/http/Events/SearchEventsQuery";
import { getRelationIds } from "./event";
import { type EventRelationIds } from "./types";

export interface SearchEventsQueryCache {
  events: Events.SearchEvent.SearchEvent[];
  actors: Map<string, Actor.Actor>;
  groups: Map<string, Group.Group>;
  groupsMembers: Map<string, GroupMember.GroupMember>;
  media: Map<string, Media.Media>;
  keywords: Map<string, Keyword.Keyword>;
  // links: Map<string, Link.Link>;
}

export const getNewRelationIds = (
  events: Events.Event[],
  s: SearchEventsQueryCache
): EventRelationIds => {
  // get relation ids from cache;

  const actorIds = pipe(s.actors, M.keys(S.Ord));
  const groupIds = pipe(s.groups, M.keys(S.Ord));
  const groupsMemberIds = pipe(s.groupsMembers, M.keys(S.Ord));
  const mediaIds = pipe(s.media, M.keys(S.Ord));
  const keywordIds = pipe(s.keywords, M.keys(S.Ord));
  // const linkIds = pipe(s.links, M.keys(S.Ord));

  const init: EventRelationIds = {
    actors: [],
    groups: [],
    groupsMembers: [],
    media: [],
    keywords: [],
    // links: [],
  };

  return pipe(
    events,
    A.reduce(init, (acc, e) => {
      const { actors, groups, groupsMembers, media, keywords } =
        getRelationIds(e);

      const newActors = actors.filter(
        (a) => ![...actorIds, ...acc.actors].includes(a)
      );

      const newGroups = groups.filter(
        (a) => ![...groupIds, ...acc.groups].includes(a)
      );
      const newGroupsMembers = groupsMembers.filter(
        (g) => ![...groupsMemberIds, ...acc.groupsMembers].includes(g)
      );
      const newMediaIds = media.filter(
        (m) => ![...acc.media, ...mediaIds].includes(m)
      );
      const newKeywordIds = keywords.filter(
        (k) => ![...keywordIds, ...acc.keywords].includes(k)
      );

      // const newLinkIds = links.filter(
      //   (k) => ![...linkIds, ...acc.links].includes(k)
      // );

      return {
        actors: acc.actors.concat(newActors),
        groups: acc.groups.concat(newGroups),
        groupsMembers: acc.groupsMembers.concat(newGroupsMembers),
        media: acc.media.concat(newMediaIds),
        keywords: acc.keywords.concat(newKeywordIds),
        // links: acc.links.concat(newLinkIds),
      };
    })
  );
};

export const updateCache = (
  s: SearchEventsQueryCache,
  update: {
    events: { data: Events.Event[]; total: number; totals: EventTotals };
    actors: Actor.Actor[];
    groups: Group.Group[];
    groupsMembers: GroupMember.GroupMember[];
    media: Media.Media[];
    keywords: Keyword.Keyword[];
    // links: Link.Link[];
  }
): SearchEventsQueryCache => {
  const actors = pipe(
    update.actors,
    A.reduce(s.actors, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    })
  );

  const groups = pipe(
    update.groups,
    A.reduce(s.groups, (accGroups, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accGroups);
    })
  );

  const groupsMembers = pipe(
    update.groupsMembers,
    A.reduce(s.groupsMembers, (accGroupsMembers, gm) => {
      return M.upsertAt(S.Eq)(gm.id, gm)(accGroupsMembers);
    })
  );

  const media = pipe(
    update.media,
    A.reduce(s.media, (accMedia, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accMedia);
    })
  );

  const keywords = pipe(
    update.keywords,
    A.reduce(s.keywords, (accActors, a) => {
      return M.upsertAt(S.Eq)(a.id, a)(accActors);
    })
  );

  // const links = pipe(
  //   update.links,
  //   A.reduce(s.links, (accActors, a) => {
  //     return M.upsertAt(S.Eq)(a.id, a)(accActors);
  //   })
  // );

  const newEvents = pipe(
    update.events.data,
    A.map((e) =>
      toSearchEvent(e, {
        actors,
        groups,
        groupsMembers,
        media,
        keywords,
        // links,
      })
    )
  );

  return {
    events: newEvents,
    actors,
    groups,
    groupsMembers,
    media,
    keywords,
    // links,
  };
};

export const toSearchEvent = (
  e: Events.Event,
  s: Omit<SearchEventsQueryCache, "events">
): Events.SearchEvent.SearchEvent => {
  const {
    actors: actorIds,
    groups: groupIds,
    groupsMembers: groupsMembersIds,
    media: mediaIds,
    keywords: keywordIds,
  } = getRelationIds(e);

  const actors = pipe(
    actorIds,
    A.map((a) => pipe(s.actors, M.lookup(S.Eq)(a))),
    A.compact
  );

  const groups = pipe(
    groupIds,
    A.map((a) => pipe(s.groups, M.lookup(S.Eq)(a))),
    A.compact
  );

  const groupsMembers = pipe(
    groupsMembersIds,
    A.map((a) => pipe(s.groupsMembers, M.lookup(S.Eq)(a))),
    A.compact
  );

  const media = pipe(
    mediaIds,
    A.map((a) => pipe(s.media, M.lookup(S.Eq)(a))),
    A.compact
  );

  const keywords = pipe(
    keywordIds,
    A.map((a) => pipe(s.keywords, M.lookup(S.Eq)(a))),
    A.compact
  );

  switch (e.type) {
    case Events.Quote.QUOTE.value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          actor: actors[0],
        },
        media,
        keywords,
      };
    }
    case Events.Death.DEATH.value: {
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
      };
    }
    case Events.EventType.types[2].value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          authors: actors,
          publisher: groups[0],
        },
        media,
        keywords,
      };
    }
    case Events.EventType.types[3].value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          owners: { actors, groups },
        },
        media,
        keywords,
      };
    }
    case Events.EventType.types[4].value: {
      return {
        ...e,
        payload: {
          ...e.payload,
          media: media.find((m) => m.id === e.payload.media) ?? media[0],
          authors: {
            actors: actors.filter((a) =>
              e.payload.authors.actors.includes(a.id)
            ),
            groups: groups.filter((g) =>
              e.payload.authors.groups.includes(g.id)
            ),
          },
          subjects: {
            actors: actors.filter((a) =>
              e.payload.subjects.actors.includes(a.id)
            ),
            groups: groups.filter((g) =>
              e.payload.subjects.groups.includes(g.id)
            ),
          },
        },
        media,
        keywords,
      };
    }
    case Events.Transaction.TRANSACTION.value: {
      const from =
        e.payload.from.type === "Group"
          ? groups.find((g) => g.id === e.payload.from.id)
          : actors.find((a) => a.id === e.payload.from.id);

      const to =
        e.payload.to.type === "Group"
          ? groups.find((g) => g.id === e.payload.to.id)
          : actors.find((a) => a.id === e.payload.to.id);

      return {
        ...e,
        payload: {
          ...e.payload,
          from: { ...e.payload.from, id: from as any },
          to: { ...e.payload.to, id: to as any },
        },
        media,
        keywords,
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
      };
    }
  }
};
