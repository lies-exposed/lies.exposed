import { Events, type Actor, type Group } from "../../io/http";
import { type SearchEvent } from "../../io/http/Events/SearchEvents/SearchEvent";

export const getSearchEventRelations = (
  e: SearchEvent,
): Events.EventRelations => {
  const commonRelations = {
    media: e.media,
    keywords: e.keywords,
    links: e.links,
    areas: [],
  };

  switch (e.type) {
    case Events.EventTypes.BOOK.value: {
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
        : [e.payload.media.pdf];

      return {
        ...commonRelations,
        media: commonRelations.media.concat(...media),
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case Events.EventTypes.DEATH.value: {
      return {
        ...commonRelations,
        actors: e.payload.victim ? [e.payload.victim] : [],
        groups: [],
        groupsMembers: [],
      };
    }
    case Events.EventTypes.TRANSACTION.value: {
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
    case Events.EventTypes.PATENT.value: {
      return {
        ...commonRelations,
        actors: e.payload.owners.actors,
        groups: e.payload.owners.groups,
        groupsMembers: [],
      };
    }

    case Events.EventTypes.DOCUMENTARY.value: {
      return {
        ...commonRelations,
        actors: [...e.payload.authors.actors, ...e.payload.subjects.actors],
        groups: [...e.payload.authors.groups, ...e.payload.subjects.groups],
        groupsMembers: [],
        media: [...commonRelations.media, e.payload.media],
      };
    }

    case Events.EventTypes.SCIENTIFIC_STUDY.value: {
      return {
        ...commonRelations,
        actors: e.payload.authors,
        groups: e.payload.publisher ? [e.payload.publisher] : [],
        groupsMembers: [],
      };
    }

    case Events.EventTypes.QUOTE.value: {
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

    case Events.EventTypes.UNCATEGORIZED.value: {
      return {
        ...commonRelations,
        actors: e.payload.actors,
        groups: e.payload.groups,
        groupsMembers: e.payload.groupsMembers,
      };
    }
  }
};
