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
import { Events, type Actor, type Common, type Group } from "../../io/http";
import { type SearchEvent } from "../../io/http/Events/SearchEvent";
import { getTextContents } from "../../slate";
import { type EventCommonProps } from "./getCommonProps.helper";
import { type EventRelationIds, type EventRelations } from "./types";

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

export const getEventMetadata = (e: SearchEvent): EventRelations => {
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

export const transform = (
  e: Events.Event,
  type: Events.EventType,
  props: EventCommonProps &
    EventRelationIds & {
      links: UUID[];
    }
): Events.Event => {
  switch (type) {
    case Events.Death.DEATH.value: {
      return {
        ...e,
        type: Events.Death.DEATH.value,
        payload: {
          victim: props.actors.at(0) as any,
          location: undefined,
        },
      };
    }
    case Events.Transaction.TRANSACTION.value: {
      const from: any =
        props.actors.length > 0
          ? {
              type: "Actor",
              id: props.actors.at(0) as any,
            }
          : {
              type: "Group",
              id: props.groups.at(0) as any,
            };
      const to: any =
        props.actors.length > 0
          ? {
              type: "Actor",
              id: props.actors.at(0) as any,
            }
          : {
              type: "Group",
              id: props.groups.at(0) as any,
            };

      return {
        ...e,
        type: Events.Transaction.TRANSACTION.value,
        payload: {
          currency: "USD",
          total: 0,
          title: props.title,
          from,
          to,
        },
      };
    }
    case Events.Patent.PATENT.value: {
      return {
        ...e,
        type: Events.Patent.PATENT.value,
        payload: {
          title: props.title as any,
          source: (props.url as any) ?? process.env.WEB_URL,
          owners: {
            groups: props.groups,
            actors: props.actors,
          },
        },
      };
    }

    case Events.Documentary.DOCUMENTARY.value: {
      return {
        ...e,
        type: Events.Documentary.DOCUMENTARY.value,
        payload: {
          title: props.title,
          website: props.url as any,
          media: props.media.at(0) as any,
          authors: {
            actors: props.actors,
            groups: props.groups,
          },
          subjects: {
            actors: props.actors,
            groups: props.groups,
          },
        },
      };
    }

    case Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return {
        ...e,
        type: Events.ScientificStudy.SCIENTIFIC_STUDY.value,
        payload: {
          title: props.title,
          image: props.media.at(0),
          url: props.url ?? (props.links.at(0) as any),
          authors: props.actors,
          publisher: props.groups.at(0) as any,
        },
      };
    }

    case Events.Quote.QUOTE.value: {
      return {
        ...e,
        type: Events.Quote.QUOTE.value,
        payload: {
          quote: e.excerpt
            ? getTextContents(e.excerpt as any)
            : undefined,
          actor: props.actors.at(0) as any,
          details: undefined,
        },
      };
    }

    default: {
      return {
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
      };
    }
  }
};
