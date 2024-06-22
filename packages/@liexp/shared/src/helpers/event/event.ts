import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { format, subWeeks } from "date-fns";
import { sequenceS } from "fp-ts/Apply";
import { type Monoid } from "fp-ts/Monoid";
import { type NonEmptyArray } from "fp-ts/NonEmptyArray";
import type * as O from "fp-ts/Option";
import { type UUID } from "io-ts-types/lib/UUID.js";
import { type EventRelationIds } from "../../io/http/Events/index.js";
import { Events, type Common, type Network } from "../../io/http/index.js";
import { toBySubjectId } from "../../io/utils/BySubjectUtils.js";
import { type EventCommonProps } from "./getCommonProps.helper.js";
import { getRelationIds } from "./getEventRelationIds.js";

const { Ord, Eq, S, N } = fp;

type EventsByYearMap = Map<number, Map<number, Events.Event[]>>;

export const eqByUUID = pipe(
  S.Eq,
  Eq.contramap((f: Common.BaseProps) => f.id),
);

interface NavigationItem {
  itemId: string;
  title: string;
  subNav?: NavigationItem[];
}

export const eventsDataToNavigatorItems = (
  events: Events.Event[],
): NavigationItem[] => {
  const initial: EventsByYearMap = new Map();

  const yearItems = events.reduce<EventsByYearMap>((acc, e) => {
    const frontmatter = e;
    const year = frontmatter.date.getFullYear();
    const month = frontmatter.date.getUTCMonth();

    const value = pipe(
      fp.Map.lookup(N.Eq)(year, acc),
      fp.O.fold(
        () => fp.Map.singleton(month, [e]),
        (monthMap) =>
          pipe(
            fp.Map.lookupWithKey(N.Eq)(month, monthMap),
            fp.O.fold(
              () => fp.Map.upsertAt(N.Eq)(month, [e])(monthMap),
              ([monthKey, eventsInMonth]) => {
                return fp.Map.upsertAt(N.Eq)(monthKey, eventsInMonth.concat(e))(
                  monthMap,
                );
              },
            ),
          ),
      ),
    );

    return fp.Map.upsertAt(N.Eq)(year, value)(acc);
  }, initial);

  const initialData: NavigationItem[] = [];
  return fp.Map.toArray(Ord.reverse(N.Ord))(yearItems).reduce<NavigationItem[]>(
    (acc, [year, monthMap]) => {
      const months = fp.Map.toArray(Ord.reverse(N.Ord))(monthMap).reduce<
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
    initialData,
  );
};

export const ordEventDate = Ord.Contravariant.contramap(
  Ord.ordDate,
  (e: { date: Date }) => e.date,
);

const colorMap: Record<Events.Event["type"], string> = {
  Book: "#451d0a",
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
      fp.A.sort(fp.Ord.reverse(ordEventDate)),
      (orderedEvents) => {
        const minDate = pipe(
          props.minDate,
          fp.O.alt(() =>
            pipe(
              fp.A.last(orderedEvents),
              fp.O.map((e) => e.date),
            ),
          ),
          fp.O.getOrElse(() => subWeeks(new Date(), 1)),
        );

        const maxDate = pipe(
          props.maxDate,
          fp.O.alt(() =>
            pipe(
              fp.A.head(orderedEvents),
              fp.O.map((e) => e.date),
            ),
          ),
          fp.O.getOrElse(() => new Date()),
        );

        return { events: orderedEvents, minDate, maxDate };
      },
      ({ events, minDate, maxDate }) => {
        return pipe(
          events,
          fp.A.filter((e) =>
            fp.Ord.between(fp.Date.Ord)(minDate, maxDate)(e.date),
          ),
        );
      },
    );
  };

const nonEmptyArrayOrNull = <A>(x: A[]): NonEmptyArray<A> | null => {
  const z = pipe(fp.NEA.fromArray(x ?? []), fp.O.toNullable);
  return z;
};

// const concatToNEAOrNull = <A>(x: A[], y: A[]): NonEmptyArray<A> | null => {
//   console.log({ x, y });
//   const z = pipe(
//     fp.NEA.fromArray(x ?? []),
//     fp.O.map((kk) => fp.NEA.concat(kk)(y ?? [])),
//     fp.O.getOrElse(() => nonEmptyArrayOrNull(y)),
//   );
//   console.log({ z });
//   return z;
// };

export const toGetNetworkQuery = ({
  keywords,
  links,
  actors,
  groups,
}: Events.EventRelationIds): Network.GetNetworkQuerySerialized => {
  return {
    relations: null,
    ids: null,
    startDate: null,
    endDate: null,
    emptyRelations: null,
    keywords: nonEmptyArrayOrNull(keywords),
    actors: nonEmptyArrayOrNull(actors),
    groups: nonEmptyArrayOrNull(groups),
  };
};

export const eventRelationIdsMonoid: Monoid<EventRelationIds> = {
  empty: {
    keywords: [],
    actors: [],
    groups: [],
    groupsMembers: [],
    media: [],
    links: [],
    areas: [],
  },
  concat: (x, y) => ({
    ...x,
    keywords: x.keywords.concat(
      y.keywords.filter((a) => !x.keywords.includes(a)),
    ),
    actors: x.actors.concat(y.actors.filter((a) => !x.actors.includes(a))),
    groups: x.groups.concat(y.groups.filter((a) => !x.groups.includes(a))),
    areas: x.areas.concat(y.areas.filter((a) => !x.areas.includes(a))),
  }),
};

export const takeEventRelations = (
  ev: Events.Event[],
): Events.EventRelationIds => {
  return pipe(
    ev.reduce(
      (acc, e) => eventRelationIdsMonoid.concat(acc, getRelationIds(e)),
      eventRelationIdsMonoid.empty,
    ),
  );
};

export const transform =
  (getTextContents: (v: any) => string) =>
  (
    e: Events.Event,
    type: Events.EventType,
    props: EventCommonProps &
      Events.EventRelationIds & {
        links: UUID[];
      },
  ): O.Option<Events.Event> => {
    switch (type) {
      case Events.EventTypes.DEATH.value: {
        return pipe(
          props.actors.at(0),
          fp.O.fromNullable,
          fp.O.map((v) => ({
            ...e,
            type: Events.EventTypes.DEATH.value,
            payload: {
              victim: v,
              location: undefined,
            },
          })),
        );
      }
      case Events.EventTypes.TRANSACTION.value: {
        const from = pipe(
          props.actors,
          fp.A.head,
          fp.O.map((id) => toBySubjectId("Actor", id)),
          fp.O.alt(() =>
            pipe(
              props.groups,
              fp.A.head,
              fp.O.map((id) => toBySubjectId("Group", id)),
            ),
          ),
        );

        const to = pipe(
          props.actors,
          fp.A.takeLeft(2),
          fp.A.head,
          fp.O.map((id) => toBySubjectId("Actor", id)),
          fp.O.alt(() =>
            pipe(
              props.groups,
              fp.A.takeLeft(2),
              fp.A.head,
              fp.O.map((id) => toBySubjectId("Group", id)),
            ),
          ),
        );

        return pipe(
          sequenceS(fp.O.Applicative)({
            to,
            from,
          }),
          fp.O.map(({ to, from }) => ({
            ...e,
            type: Events.EventTypes.TRANSACTION.value,
            payload: {
              currency: "USD",
              total: 0,
              title: props.title,
              from,
              to,
            },
          })),
        );
      }
      case Events.EventTypes.PATENT.value: {
        return pipe(
          props.url ?? props.links.at(0),
          fp.O.fromNullable,
          fp.O.map((source: any) => ({
            ...e,
            type: Events.EventTypes.PATENT.value,
            payload: {
              title: props.title,
              source,
              owners: {
                groups: props.groups,
                actors: props.actors,
              },
            },
          })),
        );
      }
      case Events.EventTypes.DOCUMENTARY.value: {
        return pipe(
          sequenceS(fp.O.Applicative)({
            media: pipe(props.media, fp.A.head),
            website: pipe(props.links, fp.A.head),
          }),
          fp.O.map(({ media, website }) => ({
            ...e,
            type: Events.EventTypes.DOCUMENTARY.value,
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
          })),
        );
      }

      case Events.EventTypes.SCIENTIFIC_STUDY.value: {
        return pipe(
          props.links,
          fp.A.head,
          fp.O.map((url) => ({
            ...e,
            type: Events.EventTypes.SCIENTIFIC_STUDY.value,
            payload: {
              title: props.title,
              image: props.media.at(0),
              url,
              authors: props.actors,
              publisher: props.groups.at(0) as any,
            },
          })),
        );
      }

      case Events.EventTypes.QUOTE.value: {
        const subjectOpt = pipe(
          props.actors,
          fp.A.head,
          fp.O.map((id) => toBySubjectId("Actor", id)),
          fp.O.alt(() =>
            pipe(
              props.groups,
              fp.A.head,
              fp.O.map((id) => toBySubjectId("Group", id)),
            ),
          ),
        );

        return pipe(
          subjectOpt,
          fp.O.map((subject) => ({
            ...e,
            type: Events.EventTypes.QUOTE.value,
            payload: {
              quote: e.excerpt ? getTextContents(e.excerpt) : undefined,
              actor: undefined,
              subject,
              details: undefined,
            },
          })),
        );
      }

      case Events.EventTypes.BOOK.value: {
        return pipe(
          sequenceS(fp.O.Applicative)({
            actorAuthors: fp.O.some(props.actors),
            media: pipe(props.media, fp.A.head),
          }),
          fp.O.map(({ actorAuthors, media }) => ({
            ...e,
            type: Events.EventTypes.BOOK.value,
            payload: {
              title: props.title,
              media: { pdf: media, audio: undefined },
              authors: actorAuthors.map((a) => ({ type: "Actor", id: a })),
              publisher: undefined,
            },
          })),
        );
      }

      default: {
        return fp.O.some({
          ...e,
          type: Events.EventTypes.UNCATEGORIZED.value,
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
  acc: Events.SearchEvent.EventTotals.EventTotals,
  e: Events.Event | Events.SearchEvent.SearchEvent,
): Events.SearchEvent.EventTotals.EventTotals => {
  return {
    uncategorized:
      acc.uncategorized + (Events.EventTypes.UNCATEGORIZED.is(e.type) ? 1 : 0),
    scientificStudies:
      acc.scientificStudies +
      (Events.EventTypes.SCIENTIFIC_STUDY.is(e.type) ? 1 : 0),
    transactions:
      acc.transactions + (Events.EventTypes.TRANSACTION.is(e.type) ? 1 : 0),
    patents: acc.patents + (Events.EventTypes.PATENT.is(e.type) ? 1 : 0),
    deaths: acc.deaths + (Events.EventTypes.DEATH.is(e.type) ? 1 : 0),
    books: acc.books + (Events.EventTypes.BOOK.is(e.type) ? 1 : 0),
    documentaries:
      acc.documentaries + (Events.EventTypes.DOCUMENTARY.is(e.type) ? 1 : 0),
    quotes: acc.quotes + (Events.EventTypes.QUOTE.is(e.type) ? 1 : 0),
  };
};
