import { Schema } from "effect";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";

export const getRelationIds = (e: Events.Event): Events.EventRelationIds => {
  const commonIds = {
    media: [...e.media],
    keywords: [...e.keywords],
    links: [...e.links],
    areas: [],
    socialPosts: [],
  };

  switch (e.type) {
    case Events.EventTypes.BOOK.Type: {
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

      const bookMedia = [e.payload.media.pdf, e.payload.media.audio].filter(
        Schema.is(UUID),
      );
      return {
        ...commonIds,
        media: commonIds.media.concat(...bookMedia),
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case Events.EventTypes.QUOTE.Type: {
      const quote =
        e.payload.subject?.type === "Actor"
          ? {
              actors: e.payload.subject?.id ? [e.payload.subject.id] : [],
              groups: [],
            }
          : e.payload.subject?.type === "Group"
            ? {
                groups: e.payload.subject?.id ? [e.payload.subject.id] : [],
                actors: [],
              }
            : {
                groups: [],
                actors: [],
              };

      return {
        ...commonIds,
        ...quote,
        groupsMembers: [],
      };
    }
    case Events.EventTypes.DEATH.Type: {
      return {
        ...commonIds,
        actors: [e.payload.victim],
        groups: [],
        groupsMembers: [],
      };
    }
    case Events.EventTypes.TRANSACTION.Type: {
      const actors = [
        e.payload.from.type === "Actor" ? e.payload.from.id : undefined,
        e.payload.to.type === "Actor" ? e.payload.to.id : undefined,
      ].filter(Schema.is(UUID));
      const groups = [
        e.payload.from.type === "Group" ? e.payload.from.id : undefined,
        e.payload.to.type === "Group" ? e.payload.to.id : undefined,
      ].filter(Schema.is(UUID));
      return {
        ...commonIds,
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case Events.EventTypes.PATENT.Type: {
      return {
        ...commonIds,
        actors: [...e.payload.owners.actors],
        groups: [...e.payload.owners.groups],
        groupsMembers: [],
      };
    }

    case Events.EventTypes.DOCUMENTARY.Type: {
      return {
        ...commonIds,
        links: commonIds.links.concat(
          e.payload.website ? [e.payload.website] : [],
        ),
        media: commonIds.media.concat(e.payload.media),
        actors: [
          ...e.payload.authors.actors,
          ...e.payload.subjects.actors,
        ].filter((a) => a !== undefined),
        groups: [
          ...e.payload.authors.groups,
          ...e.payload.subjects.groups,
        ].filter((a) => a !== undefined),
        groupsMembers: [],
      };
    }

    case Events.EventTypes.SCIENTIFIC_STUDY.Type: {
      return {
        ...commonIds,
        links: commonIds.links.concat(e.payload.url),
        actors: [...e.payload.authors],
        groups: e.payload.publisher ? [e.payload.publisher] : [],
        groupsMembers: [],
      };
    }

    case Events.EventTypes.UNCATEGORIZED.Type: {
      return {
        ...commonIds,
        actors: [...e.payload.actors],
        groups: [...e.payload.groups],
        groupsMembers: [...e.payload.groupsMembers],
      };
    }
  }
};

export const getRelationIdsFromEventRelations = (
  e: Events.EventRelations,
): Events.EventRelationIds => {
  return {
    actors: e.actors.map((a) => a.id),
    areas: e.areas.map((a) => a.id),
    groups: e.groups.map((g) => g.id),
    groupsMembers: e.groupsMembers.map((gm) => gm.id),
    keywords: e.keywords.map((k) => k.id),
    links: e.links.map((l) => l.id),
    media: e.media.map((m) => m.id),
  };
};
