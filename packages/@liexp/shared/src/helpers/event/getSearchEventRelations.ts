import { EVENT_TYPES } from "../../io/http/Events/EventType.js";
import { type SearchEvent } from "../../io/http/Events/SearchEvents/SearchEvent.js";
import { type Events, type Actor, type Group } from "../../io/http/index.js";

export const getSearchEventRelations = (
  e: SearchEvent,
): Events.EventRelations => {
  const commonRelations = {
    media: [...e.media],
    keywords: [...e.keywords],
    links: [...e.links],
    areas: [],
  };

  switch (e.type) {
    case EVENT_TYPES.BOOK: {
      const publisherActors =
        e.payload.publisher && e.payload.publisher.type === "Actor"
          ? [e.payload.publisher.id]
          : [];

      const actors = e.payload.authors
        .flatMap((a) => (a.type === "Actor" ? [a.id] : []))
        .concat(publisherActors);

      const publisherGroups =
        e.payload.publisher && e.payload.publisher.type === "Group"
          ? [e.payload.publisher.id]
          : [];

      const groups = e.payload.authors
        .flatMap((a) => (a.type === "Group" ? [a.id] : []))
        .concat(publisherGroups);

      const media = e.payload.media.audio
        ? [e.payload.media.pdf, e.payload.media.audio]
        : e.payload.media.pdf
          ? [e.payload.media.pdf]
          : [];
      const commonMediaUnique = commonRelations.media.filter(
        (cm) => !media.find((m) => m.id === cm.id),
      );
      return {
        ...commonRelations,
        media: media.concat(...commonMediaUnique),
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case EVENT_TYPES.DEATH: {
      return {
        ...commonRelations,
        actors: e.payload.victim ? [e.payload.victim] : [],
        groups: [],
        groupsMembers: [],
      };
    }
    case EVENT_TYPES.TRANSACTION: {
      const actors = [
        e.payload.from.type === "Actor" ? e.payload.from.id : undefined,
        e.payload.to.type === "Actor" ? e.payload.to.id : undefined,
      ].filter((e): e is Actor.Actor => e !== undefined);
      const groups = [
        e.payload.from.type === "Group" ? e.payload.from.id : undefined,
        e.payload.to.type === "Group" ? e.payload.to.id : undefined,
      ].filter((e): e is Group.Group => e !== undefined);
      return {
        ...commonRelations,
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case EVENT_TYPES.PATENT: {
      return {
        ...commonRelations,
        actors: [...e.payload.owners.actors],
        groups: [...e.payload.owners.groups],
        groupsMembers: [],
      };
    }

    case EVENT_TYPES.DOCUMENTARY: {
      return {
        ...commonRelations,
        actors: [...e.payload.authors.actors, ...e.payload.subjects.actors],
        groups: [...e.payload.authors.groups, ...e.payload.subjects.groups],
        groupsMembers: [],
        media: [
          ...commonRelations.media,
          ...(e.payload.media ? [e.payload.media] : []),
        ],
      };
    }

    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      return {
        ...commonRelations,
        actors: [...e.payload.authors],
        groups: e.payload.publisher ? [e.payload.publisher] : [],
        groupsMembers: [],
      };
    }

    case EVENT_TYPES.QUOTE: {
      const quote =
        e.payload.subject.type === "Group"
          ? {
              actors: [],
              groups: e.payload.subject?.id ? [e.payload.subject.id] : [],
            }
          : {
              groups: [],
              actors: e.payload.subject?.id ? [e.payload.subject.id] : [],
            };

      return {
        ...commonRelations,
        ...quote,
        groupsMembers: [],
      };
    }

    case EVENT_TYPES.UNCATEGORIZED: {
      return {
        ...commonRelations,
        actors: [...e.payload.actors],
        groups: [...e.payload.groups],
        groupsMembers: [...e.payload.groupsMembers],
      };
    }
  }
};
