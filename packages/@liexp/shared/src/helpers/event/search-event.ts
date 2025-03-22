import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BySubject } from "../../io/http/Common/index.js";
import { type EventTotals } from "../../io/http/Events/EventTotals.js";
import { type SearchBookEvent } from "../../io/http/Events/SearchEvents/SearchBookEvent.js";
import { type SearchDocumentaryEvent } from "../../io/http/Events/SearchEvents/SearchDocumentaryEvent.js";
import { type SearchQuoteEvent } from "../../io/http/Events/SearchEvents/SearchQuoteEvent.js";
import { type SearchTransactionEvent } from "../../io/http/Events/SearchEvents/SearchTransactionEvent.js";
import { type EventRelations } from "../../io/http/Events/index.js";
import { Events, type Area, type Media } from "../../io/http/index.js";
import { BySubjectUtils } from "../../io/utils/BySubjectUtils.js";
import { eventRelationIdsMonoid } from "./event.js";
import {
  getRelationIds,
  getRelationIdsFromEventRelations,
} from "./getEventRelationIds.js";
import { getSearchEventRelations } from "./getSearchEventRelations.js";

export interface SearchEventsQueryCache extends EventRelations {
  events: readonly Events.SearchEvent.SearchEvent[];
}

export const getNewRelationIds = (
  events: readonly Events.Event[],
  s: SearchEventsQueryCache,
): Events.EventRelationIds => {
  // get relation ids from cache;

  const actorIds = pipe(
    s.actors,
    fp.A.map((a) => a.id),
  );
  const groupIds = pipe(
    s.groups,
    fp.A.map((a) => a.id),
  );
  const groupsMemberIds = pipe(
    s.groupsMembers,
    fp.A.map((a) => a.id),
  );
  const mediaIds = pipe(
    s.media,
    fp.A.map((a) => a.id),
  );
  const keywordIds = pipe(
    s.keywords,
    fp.A.map((a) => a.id),
  );
  const linkIds = pipe(
    s.links,
    fp.A.map((a) => a.id),
  );
  const areaIds = pipe(
    s.areas,
    fp.A.map((a) => a.id),
  );

  const init: Events.EventRelationIds = eventRelationIdsMonoid.empty;

  return pipe(
    events,
    fp.A.reduce(init, (acc, e) => {
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
    fp.A.reduce(s.actors, (accActors, a) => {
      const existing = accActors.some((aa) => aa.id === a.id);
      return existing ? accActors : accActors.concat(a);
    }),
  );

  const groups = pipe(
    update.groups,
    fp.A.reduce(s.groups, (accGroups, a) => {
      const existing = accGroups.some((aa) => aa.id === a.id);
      return existing ? accGroups : accGroups.concat(a);
    }),
  );

  const groupsMembers = pipe(
    update.groupsMembers,
    fp.A.reduce([...s.groupsMembers], (acc, gm) => {
      const index = acc.findIndex((g) => g.id === gm.id);
      if (index === -1) {
        return acc.concat(gm);
      }
      acc[index] = gm;

      return acc;
    }),
  );

  const media = pipe(
    update.media,
    fp.A.reduce([...s.media], (acc, gm) => {
      const index = acc.findIndex((g) => g.id === gm.id);
      if (index === -1) {
        return acc.concat(gm);
      }
      acc[index] = gm;

      return acc;
    }),
  );

  const keywords = pipe(
    update.keywords,
    fp.A.reduce([...s.keywords], (acc, gm) => {
      const index = acc.findIndex((g) => g.id === gm.id);
      if (index === -1) {
        return acc.concat(gm);
      }
      acc[index] = gm;

      return acc;
    }),
  );

  const links = pipe(
    update.links,
    fp.A.reduce([...s.links], (acc, gm) => {
      const index = acc.findIndex((g) => g.id === gm.id);
      if (index === -1) {
        return acc.concat(gm);
      }
      acc[index] = gm;

      return acc;
    }),
  );

  const newEvents = pipe(
    update.events.data,
    fp.A.map((e) =>
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

  const areas: Area.Area[] = [];

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
    actorIds.map((a) => {
      return pipe(
        s.actors?.find((actor) => actor.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  const groups = pipe(
    groupIds.map((a) => {
      return pipe(
        s.groups?.find((actor) => actor.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  const groupsMembers = pipe(
    groupsMembersIds.map((a) => {
      return pipe(
        s.groupsMembers?.find((actor) => actor.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  const media = pipe(
    mediaIds.map((a) => {
      return pipe(
        s.media?.find((actor) => actor.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  const keywords = pipe(
    keywordIds.map((a) => {
      return pipe(
        s.keywords?.find((actor) => actor.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  const links = pipe(
    linkIds.map((a) => {
      return pipe(
        s.links?.find((l) => l.id === a),
        fp.O.fromNullable,
      );
    }),
    fp.A.compact,
  );

  switch (e.type) {
    case Events.EventTypes.BOOK.Type: {
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
          title: e.payload.title,
          authors,
          media: { pdf: pdfMedia, audio: audioMedia },
          publisher,
        },
        media,
        keywords,
        links,
      } satisfies SearchBookEvent;
    }
    case Events.EventTypes.QUOTE.Type: {
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
      } satisfies SearchQuoteEvent;
    }
    case Events.EventTypes.DEATH.Type: {
      return {
        ...e,
        payload: {
          ...e.payload,
          victim: actors.find((a) => a.id === e.payload.victim)!,
        },
        media,
        keywords,
        links,
      };
    }
    case Events.EventTypes.SCIENTIFIC_STUDY.Type: {
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
    case Events.EventTypes.PATENT.Type: {
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
    case Events.EventTypes.DOCUMENTARY.Type: {
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
      } satisfies SearchDocumentaryEvent;
    }
    case Events.EventTypes.TRANSACTION.Type: {
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
      } satisfies SearchTransactionEvent;
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

export const fromSearchEvent = (
  e: Events.SearchEvent.SearchEvent,
): Events.Event => {
  const relations = pipe(
    e,
    getSearchEventRelations,
    getRelationIdsFromEventRelations,
  );

  switch (e.type) {
    case Events.EventTypes.BOOK.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          media: {
            pdf: e.payload.media.pdf.id,
            audio: e.payload.media.audio?.id,
          },
          authors: BySubjectUtils.toSubjectIds([...e.payload.authors]),
          publisher: e.payload.publisher
            ? BySubjectUtils.toSubjectId(e.payload.publisher)
            : undefined,
        },
      };
    }
    case Events.EventTypes.QUOTE.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          subject: BySubjectUtils.toSubjectId(e.payload.subject),
        },
      };
    }
    case Events.EventTypes.DEATH.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          victim: e.payload.victim.id,
        },
      };
    }
    case Events.EventTypes.SCIENTIFIC_STUDY.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          url: e.payload.url!.id,
          authors: e.payload.authors.map((a) => a.id),
          publisher: e.payload.publisher?.id,
        },
      };
    }

    case Events.EventTypes.PATENT.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          source: e.payload.source?.id,
          owners: {
            actors: e.payload.owners.actors.map((a) => a.id),
            groups: e.payload.owners.groups.map((g) => g.id),
          },
        },
      };
    }

    case Events.EventTypes.DOCUMENTARY.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          media: e.payload.media.id,
          website: e.payload.website?.id,
          authors: {
            actors: e.payload.authors.actors.map((a) => a.id),
            groups: e.payload.authors.groups.map((g) => g.id),
          },
          subjects: {
            actors: e.payload.subjects.actors.map((a) => a.id),
            groups: e.payload.subjects.groups.map((g) => g.id),
          },
        },
      };
    }

    case Events.EventTypes.TRANSACTION.Type: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          from: BySubjectUtils.toSubjectId(e.payload.from),
          to: BySubjectUtils.toSubjectId(e.payload.to),
        },
      };
    }

    default: {
      return {
        ...e,
        ...relations,
        payload: {
          ...e.payload,
          ...relations,
        },
      };
    }
  }
};
