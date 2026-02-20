import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid, type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type * as Common from "@liexp/io/lib/http/Common/index.js";
import {
  DEATH,
  EVENT_TYPES,
  PATENT,
  TRANSACTION,
} from "@liexp/io/lib/http/Events/EventType.js";
import { type EventRelationIds } from "@liexp/io/lib/http/Events/index.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import type * as Network from "@liexp/io/lib/http/Network/Network.js";
import { makeBySubjectId } from "@liexp/io/lib/utils/BySubjectUtils.js";
import { format, subWeeks } from "date-fns";
import { Match } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type Monoid } from "fp-ts/lib/Monoid.js";
import type * as O from "fp-ts/lib/Option.js";
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
  fp.Date.Ord,
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
  (events: Events.Event[]): readonly Events.Event[] => {
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

const nonEmptyArrayOrNull = <A>(
  x: readonly A[],
): readonly [A, ...A[]] | null => {
  return fp.Utils.NEA.nonEmptyArrayOr(x ?? [], null);
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
    keywords: x.keywords.concat(
      y.keywords.filter((a) => !x.keywords.includes(a)),
    ),
    links: x.links.concat(y.links.filter((a) => !x.links.includes(a))),
    media: x.media.concat(y.media.filter((a) => !x.media.includes(a))),
    actors: x.actors.concat(y.actors.filter((a) => !x.actors.includes(a))),
    groups: x.groups.concat(y.groups.filter((a) => !x.groups.includes(a))),
    areas: x.areas.concat(y.areas.filter((a) => !x.areas.includes(a))),
    groupsMembers: x.groupsMembers.concat(
      y.groupsMembers.filter((a) => !x.groupsMembers.includes(a)),
    ),
  }),
};

export interface EventCommonProps {
  title: string;
  excerpt?: string;
  body?: string;
  url?: string;
  location?: UUID;
  date?: Date[];
}

const getEventCommonProps = (
  e: Events.Event,
  relations: Events.EventRelations,
): EventCommonProps => {
  const title = getTitle(e, relations);
  switch (e.type) {
    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      return {
        title,
        url: e.payload.url,
        date: [e.date],
      };
    }
    case EVENT_TYPES.PATENT: {
      return {
        title,
        url: e.payload.source,
        date: [e.date],
      };
    }
    case EVENT_TYPES.DOCUMENTARY: {
      return {
        title,
        url:
          relations.links.find((l) => l.id === e.payload.website)?.title ??
          relations.links.at(-1)?.title ??
          e.payload.website ??
          "no url",
        date: [e.date],
      };
    }
    case EVENT_TYPES.UNCATEGORIZED: {
      return {
        title,
        url: undefined,
        date: e.payload.endDate ? [e.date, e.payload.endDate] : [e.date],
        location: e.payload.location,
      };
    }
    default: {
      return {
        title,
        url: undefined,
      };
    }
  }
};

interface EventHelper<E> {
  getTitle: (event: E, relationIds: Events.EventRelations) => string;
  getCommonProps: (
    event: E,
    relations: Events.EventRelations,
  ) => EventCommonProps;
  transform: (
    event: E,
    targetType: Events.EventType,
    props: EventCommonProps & Events.EventRelationIds,
  ) => O.Option<E>;
}

export const takeEventRelations = (
  ev: readonly Events.Event[],
): Events.EventRelationIds => {
  return pipe(
    ev.reduce(
      (acc, e) => eventRelationIdsMonoid.concat(acc, getRelationIds(e)),
      eventRelationIdsMonoid.empty,
    ),
  );
};

export const buildEvent = (
  type: Events.EventType,
  props: EventCommonProps & Events.EventRelationIds,
): O.Option<Events.Event> => {
  const commonProps = {
    id: uuid(),
    excerpt: null,
    body: null,
    draft: true,
    links: [],
    media: [],
    keywords: [],
    socialPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  };
  return Match.value(type).pipe(
    Match.withReturnType<O.Option<Events.Event>>(),
    Match.when(DEATH.literals[0], () => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          actor: fp.O.fromNullable(props.actors.at(0)),
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ actor, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.DEATH,
          date,
          payload: {
            victim: actor,
            location: undefined,
          },
        })),
      );
    }),
    Match.when(TRANSACTION.literals[0], () => {
      const from = pipe(
        props.actors,
        fp.A.head,
        fp.O.map((id) => makeBySubjectId("Actor", id)),
        fp.O.alt(() =>
          pipe(
            props.groups,
            fp.A.head,
            fp.O.map((id) => makeBySubjectId("Group", id)),
          ),
        ),
      );

      const to = pipe(
        [...props.actors],
        fp.A.takeLeft(2),
        fp.A.head,
        fp.O.map((id) => makeBySubjectId("Actor", id)),
        fp.O.alt(() =>
          pipe(
            [...props.groups],
            fp.A.takeLeft(2),
            fp.A.head,
            fp.O.map((id) => makeBySubjectId("Group", id)),
          ),
        ),
      );

      return pipe(
        sequenceS(fp.O.Applicative)({
          to,
          from,
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ to, from, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.TRANSACTION,
          date,
          payload: {
            currency: "USD",
            total: 0,
            title: props.title,
            from,
            to,
          },
        })),
      );
    }),
    Match.when(PATENT.literals[0], () => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          source: fp.O.fromNullable(props.links.at(0)),
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ source, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.PATENT,
          date,
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
    }),
    Match.when(EVENT_TYPES.DOCUMENTARY, () => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          media: pipe([...props.media], fp.A.head),
          website: pipe([...props.links], fp.A.head),
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ media, website, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.DOCUMENTARY,
          date,
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
    }),
    Match.when(EVENT_TYPES.SCIENTIFIC_STUDY, () => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          url: fp.O.fromNullable(props.links.at(0)),
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ url, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date,
          payload: {
            title: props.title,
            image: props.media.at(0),
            url,
            authors: props.actors,
            publisher: props.groups.at(0),
          },
        })),
      );
    }),
    Match.when(EVENT_TYPES.QUOTE, () => {
      const subjectOpt = pipe(
        props.actors,
        fp.A.head,
        fp.O.map((id) => makeBySubjectId("Actor", id)),
        fp.O.alt(() =>
          pipe(
            props.groups,
            fp.A.head,
            fp.O.map((id) => makeBySubjectId("Group", id)),
          ),
        ),
      );

      return pipe(
        sequenceS(fp.O.Applicative)({
          subject: subjectOpt,
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ subject, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.QUOTE,
          date,
          payload: {
            quote: props.excerpt ?? undefined,
            actor: undefined,
            subject,
            details: undefined,
          },
        })),
      );
    }),
    Match.when(EVENT_TYPES.BOOK, () => {
      return pipe(
        sequenceS(fp.O.Applicative)({
          actorAuthors: fp.O.some(props.actors),
          media: pipe(props.media, fp.A.head),
          date: fp.O.fromNullable(props.date?.at(0)),
        }),
        fp.O.map(({ actorAuthors, media, date }) => ({
          ...commonProps,
          type: EVENT_TYPES.BOOK,
          date,
          payload: {
            title: props.title,
            media: { pdf: media, audio: undefined },
            authors: actorAuthors.map((a) => ({
              type: "Actor" as const,
              id: a,
            })),
            publisher: undefined,
          },
        })),
      );
    }),
    Match.when(EVENT_TYPES.UNCATEGORIZED, () => {
      return pipe(
        fp.O.fromNullable(props.date?.at(0)),
        fp.O.map((date) => ({
          ...commonProps,
          type: EVENT_TYPES.UNCATEGORIZED,
          date,
          payload: {
            title: props.title,
            location: props.location ?? undefined,
            endDate: props.date?.at(1) ?? undefined,
            actors: props.actors,
            groups: props.groups,
            groupsMembers: props.groupsMembers,
          },
        })),
      );
    }),
    Match.exhaustive,
  );
};

export const transform = (
  e: Events.Event,
  type: Events.EventType,
  props: EventCommonProps & Events.EventRelationIds,
): O.Option<Events.Event> => {
  return pipe(
    buildEvent(type, props),
    fp.O.map((event) => {
      return {
        ...e,
        ...event,
      } as Events.Event;
    }),
  );
};

export const getTitle = (
  event: Events.Event,
  relations: Events.EventRelations,
): string => {
  switch (event.type) {
    case EVENT_TYPES.BOOK:
    case EVENT_TYPES.DOCUMENTARY:
    case EVENT_TYPES.PATENT:
    case EVENT_TYPES.SCIENTIFIC_STUDY:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.UNCATEGORIZED:
      return event.payload.title;
    case EVENT_TYPES.QUOTE: {
      const byActor = relations?.actors?.[0] ?? { fullName: "Unknown" };
      return `${byActor.fullName} - `.concat(
        event.payload.details
          ? `${event.payload.details}`
          : (event.payload.quote
              ?.split(" ")
              .slice(0, 10)
              .join(" ")
              .concat("...") ?? ""),
      );
    }
    case EVENT_TYPES.DEATH: {
      const victimName =
        (relations?.actors ?? []).find((a) => a.id === event.payload.victim)
          ?.fullName ?? "unknown";
      return `Death of ${victimName}`;
    }
  }
};

const EventHelper: EventHelper<Events.Event> = {
  getTitle,
  getCommonProps: getEventCommonProps,
  transform,
};

export { EventHelper };
