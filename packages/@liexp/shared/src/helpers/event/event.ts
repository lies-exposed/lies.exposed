import { format, subWeeks } from "date-fns";
import * as A from "fp-ts/Array";
import * as Eq from "fp-ts/Eq";
import * as Map from "fp-ts/Map";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import { pipe } from "fp-ts/function";
import * as N from "fp-ts/number";
import * as S from "fp-ts/string";
import { UUID } from "io-ts-types/lib/UUID";
import {
  type Actor,
  type Common,
  Events,
  type Group,
  type GroupMember,
  type Keyword,
  type Media,
  type Project,
} from "../../io/http";
import { type SearchEvent } from "../../io/http/Events/SearchEvent";

type EventsByYearMap = Map<number, Map<number, Events.Event[]>>;

export const eqByUUID = pipe(
  S.Eq,
  Eq.contramap((f: Common.BaseProps) => f.id)
);

interface NavigationItem {
  itemId: string;
  title: string;
  subNav?: NavigationItem[];
}

export const eventsDataToNavigatorItems = (
  events: Events.Event[]
): NavigationItem[] => {
  const initial: EventsByYearMap = Map.empty;

  const yearItems = events.reduce<EventsByYearMap>((acc, e) => {
    const frontmatter = e;
    const year = frontmatter.date.getFullYear();
    const month = frontmatter.date.getUTCMonth();

    const value = pipe(
      Map.lookup(N.Eq)(year, acc),
      O.fold(
        () => Map.singleton(month, [e]),
        (monthMap) =>
          pipe(
            Map.lookupWithKey(N.Eq)(month, monthMap),
            O.fold(
              () => Map.upsertAt(N.Eq)(month, [e])(monthMap),
              ([monthKey, eventsInMonth]) => {
                return Map.upsertAt(N.Eq)(monthKey, eventsInMonth.concat(e))(
                  monthMap
                );
              }
            )
          )
      )
    );

    return Map.upsertAt(N.Eq)(year, value)(acc);
  }, initial);

  const initialData: NavigationItem[] = [];
  return Map.toArray(Ord.reverse(N.Ord))(yearItems).reduce<NavigationItem[]>(
    (acc, [year, monthMap]) => {
      const months = Map.toArray(Ord.reverse(N.Ord))(monthMap).reduce<
        NavigationItem[]
      >((monthAcc, [month, events]) => {
        return monthAcc.concat({
          itemId: `#m-${month.toString()}`,
          title: format(new Date().setMonth(month), "MMMM"),
          subNav: events.map((e) => ({
            title: "",
            itemId: `#${e.id}`,
          })),
        });
      }, []);

      return acc.concat({
        itemId: `#y-${year.toString()}`,
        title: year.toString(),
        subNav: months,
      });
    },
    initialData
  );
};

export const filterMetadataForActor =
  (actor: Actor.Actor) =>
  (metadata: Events.Event): boolean => {
    // const byActor = isByActor(actor);

    switch (metadata.type) {
      // case Events.ProjectTransaction.PROJECT_TRANSACTION: {
      //   return (
      //     metadata.transaction.by.type === "Actor" &&
      //     byActor(metadata.transaction.by)
      //   );
      // }
      // case Events.ProjectImpact.type.props.type.value: {
      //   return (
      //     metadata.approvedBy.some(byActor) ?? metadata.executedBy.some(byActor)
      //   );
      // }
      // case "Condemned":
      // case "Arrest": {
      //   return byActor(metadata.who);
      // }
      // case Events.Protest.PROTEST.value: {
      //   return metadata.organizers.some(byActor);
      // }
      default:
        return false;
    }
  };

export const filterMetadataFroProject =
  (project: Project.Project) =>
  (metadata: Events.Event): boolean => {
    switch (metadata.type) {
      // case "ProjectTransaction":
      //   return metadata.project.id === project.id;
      // case "ProjectImpact":
      //   return metadata.project === project.id;
      // case Events.Protest.PROTEST.value: {
      //   return (
      //     metadata.for.type === "Project" &&
      //     metadata.for.project.id === project.id
      //   );
      // }
      // case "Arrest": {
      //   return metadata.for.some(
      //     (f) => f.type === "Project" && f.project.id === project.id
      //   );
      // }
      default:
        return false;
    }
  };

export const ordEventDate = Ord.ord.contramap(
  Ord.ordDate,
  (e: { date: Date }) => e.date
);

const colorMap: Record<Events.Event["type"], string> = {
  Death: "#000",
  ScientificStudy: "#e43a01",
  Uncategorized: "#ccc111",
  Patent: "#e873aa",
  Documentary: "#981a1a",
  Transaction: "#ba91ed",
  Quote: "#ec0e5a",
};
export const getColorByEventType = ({
  type,
}: {
  type: Events.Event["type"];
}): string => {
  return colorMap[type];
};
interface EventsInDateRangeProps {
  minDate: O.Option<Date>;
  maxDate: O.Option<Date>;
}

export const eventsInDateRange =
  (props: EventsInDateRangeProps) =>
  (events: Events.Event[]): Events.Event[] => {
    return pipe(
      events,
      A.sort(Ord.getDualOrd(ordEventDate)),
      (orderedEvents) => {
        const minDate = pipe(
          props.minDate,
          O.alt(() =>
            pipe(
              A.last(orderedEvents),
              O.map((e) => e.date)
            )
          ),
          O.getOrElse(() => subWeeks(new Date(), 1))
        );

        const maxDate = pipe(
          props.maxDate,
          O.alt(() =>
            pipe(
              A.head(orderedEvents),
              O.map((e) => e.date)
            )
          ),
          O.getOrElse(() => new Date())
        );

        return { events: orderedEvents, minDate, maxDate };
      },
      ({ events, minDate, maxDate }) => {
        return pipe(
          events,
          A.filter((e) => Ord.between(Ord.ordDate)(minDate, maxDate)(e.date))
        );
      }
    );
  };

export const extractEventsMetadata =
  (
    opts:
      | { type: "Project"; elem: Project.Project }
      | { type: "Actor"; elem: Actor.Actor }
  ) =>
  (events: Events.Event[]): Events.EventListMap => {
    const init: Map<string, Events.Event[]> = Map.empty;
    const results = pipe(
      events,
      A.filter((e) => {
        switch (opts.type) {
          case "Actor": {
            return filterMetadataForActor(opts.elem)(e);
          }
          case "Project":
          default: {
            return filterMetadataFroProject(opts.elem)(e);
          }
        }
      }),
      A.reduce(init, (acc, m) => {
        return pipe(
          Map.lookup(Eq.eqString)(m.type, acc),
          O.getOrElse((): Events.Event[] => []),
          (storedMeta) =>
            Map.insertAt(Eq.eqString)(m.type, storedMeta.concat(m))(acc)
        );
      }),
      Map.toArray(Ord.ordString),
      A.reduce(
        {
          PublicAnnouncement: [],
          ProjectTransaction: [],
          ProjectImpact: [],
          Protest: [],
          StudyPublished: [],
          Arrest: [],
          Death: [],
          Condemned: [],
          Uncategorized: [],
          Transaction: [],
        },
        (acc, [index, m]) => ({
          ...acc,
          [index]: m,
        })
      )
    );

    return results;
  };

export interface EventRelationIds {
  actors: UUID[];
  groups: UUID[];
  groupsMembers: UUID[];
  keywords: UUID[];
  media: UUID[];
  // links: string[]
}

export const getRelationIds = (e: Events.Event): EventRelationIds => {
  const commonIds = {
    media: e.media,
    keywords: e.keywords,
    links: e.links,
  };

  switch (e.type) {
    case Events.Quote.QUOTE.value: {
      return {
        ...commonIds,
        actors: [e.payload.actor],
        groups: [],
        groupsMembers: [],
      };
    }
    case Events.Death.DEATH.value: {
      return {
        ...commonIds,
        actors: [e.payload.victim],
        groups: [],
        groupsMembers: [],
      };
    }
    case Events.Transaction.TRANSACTION.value: {
      const actors = [
        e.payload.from.type === "Actor" ? e.payload.from.id : undefined,
        e.payload.to.type === "Actor" ? e.payload.to.id : undefined,
      ].filter(UUID.is);
      const groups = [
        e.payload.from.type === "Group" ? e.payload.from.id : undefined,
        e.payload.to.type === "Group" ? e.payload.to.id : undefined,
      ].filter(UUID.is);
      return {
        ...commonIds,
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case Events.Patent.PATENT.value: {
      return {
        ...commonIds,
        actors: e.payload.owners.actors,
        groups: e.payload.owners.groups,
        groupsMembers: [],
      };
    }

    case Events.Documentary.DOCUMENTARY.value: {
      return {
        ...commonIds,
        actors: [
          ...e.payload.authors.actors,
          ...e.payload.subjects.actors,
        ].filter((a) => a !== undefined),
        groups: [
          ...e.payload.authors.groups,
          ...e.payload.subjects.groups,
        ].filter((a) => a !== undefined),
        groupsMembers: [],
        media: [e.payload.media, ...commonIds.media],
      };
    }

    case Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return {
        ...commonIds,
        actors: e.payload.authors,
        groups: e.payload.publisher ? [e.payload.publisher] : [],
        groupsMembers: [],
      };
    }

    case Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        ...commonIds,
        actors: e.payload.actors,
        groups: e.payload.groups,
        groupsMembers: e.payload.groupsMembers,
      };
    }
  }
};

export const takeEventRelations = (ev: Events.Event[]): EventRelationIds => {
  return pipe(
    ev.reduce(
      (acc: EventRelationIds, e) => {
        const { actors, keywords, groups, groupsMembers, media } =
          getRelationIds(e);
        return {
          keywords: acc.keywords.concat(
            keywords.filter((k) => !acc.keywords.includes(k))
          ),
          actors: acc.actors.concat(
            actors.filter((a) => !acc.actors.includes(a))
          ),
          groups: acc.groups.concat(
            groups.filter((g) => !acc.groups.includes(g))
          ),
          groupsMembers: acc.groupsMembers.concat(groupsMembers),
          media: acc.media.concat(media),
          links: [],
        };
      },
      {
        keywords: [],
        groups: [],
        actors: [],
        groupsMembers: [],
        media: [],
        links: [],
      }
    )
  );
};

export interface EventRelations {
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
}

export const getEventsMetadata = (e: SearchEvent): EventRelations => {
  const commonIds = {
    media: e.media,
    keywords: e.keywords,
    links: e.links,
  };

  switch (e.type) {
    case Events.Death.DEATH.value: {
      return {
        ...commonIds,
        actors: e.payload.victim ? [e.payload.victim] : [],
        groups: [],
        groupsMembers: [],
      };
    }
    case Events.Transaction.TRANSACTION.value: {
      const actors = [
        e.payload.from.type === "Actor" ? e.payload.from.id : undefined,
        e.payload.to.type === "Actor" ? e.payload.to.id : undefined,
      ].filter((e): e is Actor.Actor => e !== undefined);
      const groups = [
        e.payload.from.type === "Group" ? e.payload.from.id : undefined,
        e.payload.to.type === "Group" ? e.payload.to.id : undefined,
      ].filter((e): e is Group.Group => e !== undefined);
      return {
        ...commonIds,
        actors,
        groups,
        groupsMembers: [],
      };
    }
    case Events.Patent.PATENT.value: {
      return {
        ...commonIds,
        actors: e.payload.owners.actors,
        groups: e.payload.owners.groups,
        groupsMembers: [],
      };
    }

    case Events.Documentary.DOCUMENTARY.value: {
      return {
        ...commonIds,
        actors: [...e.payload.authors.actors, ...e.payload.subjects.actors],
        groups: [...e.payload.authors.groups, ...e.payload.subjects.groups],
        groupsMembers: [],
        media: [...commonIds.media, e.payload.media],
      };
    }

    case Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return {
        ...commonIds,
        actors: e.payload.authors,
        groups: e.payload.publisher ? [e.payload.publisher] : [],
        groupsMembers: [],
      };
    }

    case Events.Quote.QUOTE.value: {
      return {
        ...commonIds,
        actors: [e.payload.actor],
        groups: [],
        groupsMembers: [],
      };
    }

    case Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        ...commonIds,
        actors: e.payload.actors,
        groups: e.payload.groups,
        groupsMembers: e.payload.groupsMembers,
      };
    }
  }
};
