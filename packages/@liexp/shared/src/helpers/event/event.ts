import { format, subWeeks } from "date-fns";
import * as A from "fp-ts/Array";
import * as Eq from "fp-ts/Eq";
import * as Map from "fp-ts/Map";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { type Monoid } from "fp-ts/lib/Monoid";
import * as N from "fp-ts/number";
import * as S from "fp-ts/string";
import { UUID } from "io-ts-types/lib/UUID";
import { Events, type Actor, type Common, type Group } from "../../io/http";
import { type BySubject } from "../../io/http/Common";
import { type SearchEvent } from "../../io/http/Events/SearchEvent";
import { getTextContents } from "../../slate";
import { type EventCommonProps } from "./getCommonProps.helper";
import { type EventRelationIds } from "@io/http/Events";

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

export const getRelationIds = (e: Events.Event): Events.EventRelationIds => {
  const commonIds = {
    media: e.media,
    keywords: e.keywords,
    links: e.links,
    areas: [],
  };

  switch (e.type) {
    case Events.Quote.QUOTE.value: {
      return {
        ...commonIds,
        actors: e.payload.actor ? [e.payload.actor] : [],
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
        links: commonIds.links.concat(e.payload.url),
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

const eventRelationIdsMonoid: Monoid<EventRelationIds> = {
  empty: {
    keywords: [],
    actors: [],
    groups: [],
    groupsMembers: [],
    media: [],
    links: [],
  },
  concat: (x, y) => ({
    ...x,
    keywords: x.keywords.concat(
      y.keywords.filter((a) => !x.keywords.includes(a))
    ),
    actors: x.actors.concat(y.actors.filter((a) => !x.actors.includes(a))),
    groups: x.groups.concat(y.groups.filter((a) => !x.groups.includes(a))),
  }),
};

export const takeEventRelations = (
  ev: Events.Event[]
): Events.EventRelationIds => {
  return pipe(
    ev.reduce(
      (acc, e) => eventRelationIdsMonoid.concat(acc, getRelationIds(e)),
      eventRelationIdsMonoid.empty
    )
  );
};

export const getEventMetadata = (e: SearchEvent): Events.EventRelations => {
  const commonIds = {
    media: e.media,
    keywords: e.keywords,
    links: e.links,
    areas: [],
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
        actors: e.payload.actor ? [e.payload.actor] : [],
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

export const transform = (
  e: Events.Event,
  type: Events.EventType,
  props: EventCommonProps &
    Events.EventRelationIds & {
      links: UUID[];
    }
): O.Option<Events.Event> => {
  switch (type) {
    case Events.Death.DEATH.value: {
      return pipe(
        props.actors.at(0),
        O.fromNullable,
        O.map((v) => ({
          ...e,
          type: Events.Death.DEATH.value,
          payload: {
            victim: v,
            location: undefined,
          },
        }))
      );
    }
    case Events.Transaction.TRANSACTION.value: {
      const from = pipe(
        props.actors,
        A.head,
        O.map((id): BySubject => ({ type: "Actor", id })),
        O.alt(() =>
          pipe(
            props.groups,
            A.head,
            O.map((id): BySubject => ({ type: "Group", id }))
          )
        )
      );

      const to = pipe(
        props.actors,
        A.takeLeft(2),
        A.head,
        O.map((id): BySubject => ({ type: "Actor" as const, id })),
        O.alt(() =>
          pipe(
            props.groups,
            A.takeLeft(2),
            A.head,
            O.map((id): BySubject => ({ type: "Group" as const, id }))
          )
        )
      );

      return pipe(
        sequenceS(O.Applicative)({
          to,
          from,
        }),
        O.map(({ to, from }) => ({
          ...e,
          type: Events.Transaction.TRANSACTION.value,
          payload: {
            currency: "USD",
            total: 0,
            title: props.title,
            from,
            to,
          },
        }))
      );
    }
    case Events.Patent.PATENT.value: {
      return pipe(
        props.url,
        O.fromNullable,
        O.chainNullableK((url) => props.links.at(0)),
        O.map((source: any) => ({
          ...e,
          type: Events.Patent.PATENT.value,
          payload: {
            title: props.title,
            source,
            owners: {
              groups: props.groups,
              actors: props.actors,
            },
          },
        }))
      );
    }

    case Events.Documentary.DOCUMENTARY.value: {
      return pipe(
        sequenceS(O.Applicative)({
          media: pipe(props.media, A.head),
          website: pipe(props.links, A.head),
        }),
        O.map(({ media, website }) => ({
          ...e,
          type: Events.Documentary.DOCUMENTARY.value,
          payload: {
            title: props.title,
            website,
            media,
            authors: {
              actors: props.actors,
              groups: props.groups,
            },
            subjects: {
              actors: props.actors,
              groups: props.groups,
            },
          },
        }))
      );
    }

    case Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return pipe(
        props.links,
        A.head,
        O.map((url) => ({
          ...e,
          type: Events.ScientificStudy.SCIENTIFIC_STUDY.value,
          payload: {
            title: props.title,
            image: props.media.at(0),
            url,
            authors: props.actors,
            publisher: props.groups.at(0) as any,
          },
        }))
      );
    }

    case Events.Quote.QUOTE.value: {
      return pipe(
        props.actors,
        A.head,
        O.map((actor) => ({
          ...e,
          type: Events.Quote.QUOTE.value,
          payload: {
            quote: e.excerpt ? getTextContents(e.excerpt as any) : undefined,
            actor,
            details: undefined,
          },
        }))
      );
    }

    default: {
      return O.some({
        ...e,
        type: Events.Uncategorized.UNCATEGORIZED.value,
        payload: {
          title: props.title,
          location: props.location,
          endDate: props.date?.at(1),
          actors: props.actors,
          groups: props.groups,
          groupsMembers: props.groupsMembers,
        },
      });
    }
  }
};

export const getTotals = (
  acc: Events.SearchEvent.SearchEventsQuery.EventTotals,
  e: Events.Event | Events.SearchEvent.SearchEvent
): Events.SearchEvent.SearchEventsQuery.EventTotals => {
  return {
    uncategorized:
      acc.uncategorized +
      (Events.Uncategorized.UNCATEGORIZED.is(e.type) ? 1 : 0),
    scientificStudies:
      acc.scientificStudies +
      (Events.ScientificStudy.SCIENTIFIC_STUDY.is(e.type) ? 1 : 0),
    transactions:
      acc.transactions + (Events.Transaction.TRANSACTION.is(e.type) ? 1 : 0),
    patents: acc.patents + (Events.Patent.PATENT.is(e.type) ? 1 : 0),
    deaths: acc.deaths + (Events.Death.DEATH.is(e.type) ? 1 : 0),
    documentaries:
      acc.documentaries + (Events.Documentary.DOCUMENTARY.is(e.type) ? 1 : 0),
    quotes: acc.quotes + (Events.Quote.QUOTE.is(e.type) ? 1 : 0),
  };
};
