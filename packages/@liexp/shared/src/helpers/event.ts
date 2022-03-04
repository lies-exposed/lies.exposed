
import { format, subWeeks } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import { pipe } from "fp-ts/lib/function";
import * as Map from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import {
  Actor, Common,
  Events, Group, GroupMember, Keyword,
  Media, Project
} from "../io/http";
import { SearchEvent } from "../io/http/Events/SearchEvent";
import { eventMetadataMapEmpty } from "../mock-data/events/events-metadata";

type EventsByYearMap = Map<number, Map<number, Events.Event[]>>;

export const eqByUUID = pipe(
  Eq.eqString,
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
      Map.lookup(Eq.eqNumber)(year, acc),
      O.fold(
        () => Map.singleton(month, [e]),
        (monthMap) =>
          pipe(
            Map.lookupWithKey(Eq.eqNumber)(month, monthMap),
            O.fold(
              () => Map.insertAt(Eq.eqNumber)(month, [e])(monthMap),
              ([monthKey, eventsInMonth]) => {
                return Map.insertAt(Eq.eqNumber)(
                  monthKey,
                  eventsInMonth.concat(e)
                )(monthMap);
              }
            )
          )
      )
    );

    return Map.insertAt(Eq.eqNumber)(year, value)(acc);
  }, initial);

  const initialData: NavigationItem[] = [];
  return Map.toArray(Ord.getDualOrd(Ord.ordNumber))(yearItems).reduce<
    NavigationItem[]
  >((acc, [year, monthMap]) => {
    const months = Map.toArray(Ord.getDualOrd(Ord.ordNumber))(monthMap).reduce<
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
  }, initialData);
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
  Death: "black",
  ScientificStudy: "lightblue",
  Uncategorized: "grey",
  Patent: "purple",
  Documentary: "orange",
  Transaction: "green",
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
      A.reduce(eventMetadataMapEmpty, (acc, [index, m]) => ({
        ...acc,
        [index]: m,
      }))
    );

    return results;
  };

interface EventRelationIds {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  keywords: string[];
  media: string[];
}

export const getRelationIds = (e: Events.Event): EventRelationIds => {
  const commonIds = {
    media: e.media,
    keywords: e.keywords,
  };

  switch (e.type) {
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
      ].filter((e): e is string => e !== undefined);
      const groups = [
        e.payload.from.type === "Group" ? e.payload.from.id : undefined,
        e.payload.to.type === "Group" ? e.payload.to.id : undefined,
      ].filter((e): e is string => e !== undefined);
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

    case Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        ...commonIds,
        actors: [],
        groups: [],
        groupsMembers: [],
      };
    }
  }
};

interface EventRelations {
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
  };

  switch (e.type) {
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
        actors: [
          ...e.payload.authors.actors,
          ...e.payload.subjects.actors,
        ].filter((a) => a !== undefined),
        groups: [
          ...e.payload.authors.groups,
          ...e.payload.subjects.groups,
        ].filter((_) => _ !== undefined),
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

    case Events.Uncategorized.UNCATEGORIZED.value: {
      return {
        ...commonIds,
        actors: [],
        groups: [],
        groupsMembers: [],
      };
    }
  }
};
