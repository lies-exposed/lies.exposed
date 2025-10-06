import { fp } from "@liexp/core/lib/fp/index.js";
import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals.js";
import {
  EventType,
  type SearchEvent,
} from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type NetworkLink,
  type NetworkGraphOutput,
  type EventNetworkDatum,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import { differenceInDays, parseISO } from "date-fns";
import { Schema } from "effect";
import { type Either } from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  type ActorNetworkNodeProps,
  toActorNodes,
} from "../../../components/Common/Graph/Network/nodes/ActorNode.js";
import { type EventNetworkNodeProps } from "../../../components/Common/Graph/Network/nodes/EventNode.js";
import {
  type GroupNetworkNodeProps,
  toGroupNodes,
} from "../../../components/Common/Graph/Network/nodes/GroupNode.js";
import {
  type KeywordNetworkNodeProps,
  toKeywordNodes,
} from "../../../components/Common/Graph/Network/nodes/KeywordNode.js";

type Validator = (
  selectedKeywordIds: readonly string[] | undefined,
  relationIds: readonly UUID[],
) => (e: EventNetworkDatum) => Either<string, EventNetworkDatum>;
const hasKeywords: Validator = (selectedKeywordIds, relationIds) => (e) => {
  if (selectedKeywordIds && selectedKeywordIds.length > 0) {
    const hasKeyword = relationIds.some((id) =>
      (selectedKeywordIds ?? []).includes(id),
    );

    if (!hasKeyword) {
      return fp.E.left(
        `${e.id} has no keywords ${selectedKeywordIds} in ${relationIds.join(
          ", ",
        )}`,
      );
    }
  }

  return fp.E.right(e);
};
const hasActors: Validator = (selectedActorIds, relationIds) => (e) => {
  // console.log("event relations", eventRelations);
  if (selectedActorIds && selectedActorIds.length > 0) {
    // console.log("filter per actors", eventRelations.actors);
    const hasActor = relationIds.some((a) =>
      (selectedActorIds ?? []).includes(a),
    );
    if (!hasActor) {
      // console.log("no actors found", selectedActorIds);
      return fp.E.left(
        `${e.id} has no actors ${selectedActorIds} in ${relationIds}`,
      );
    }
  }

  return fp.E.right(e);
};
const hasGroups: Validator = (selectedGroupIds, relationIds) => (e) => {
  if (selectedGroupIds && selectedGroupIds.length > 0) {
    // console.log("filter per groups", selectedGroupIds);
    const hasGroup = relationIds.some((a) =>
      (selectedGroupIds ?? []).includes(a),
    );

    if (!hasGroup) {
      // console.log("no groups found", selectedGroupIds);
      return fp.E.left(
        `${e.id} has no groups ${selectedGroupIds} in ${relationIds}`,
      );
    }
  }
  return fp.E.right(e);
};
const isBetweenDates =
  (startDate: Date, endDate: Date) =>
  (e: EventNetworkDatum): Either<string, EventNetworkDatum> => {
    const date = e.date;
    const min = differenceInDays(date, startDate);

    if (min < 0) {
      // console.log(`Days to start date ${startDate}`, min);
      return fp.E.left(
        `${e.id} date ${e.date} is less than min date ${startDate}`,
      );
    }

    const max = differenceInDays(endDate, date);

    if (max < 0) {
      // console.log(`Days to endDate date ${endDate}`, max);
      return fp.E.left(
        `${e.id} date ${e.date} is greater than max date ${endDate}`,
      );
    }

    return fp.E.right(e);
  };
const hasType =
  (eventType: string | readonly string[] | undefined) =>
  (e: EventNetworkDatum): Either<string, EventNetworkDatum> => {
    const isTypeIncluded: boolean = pipe(
      eventType,
      fp.O.fromNullable,
      fp.O.chain((et) =>
        Schema.is(EventType)(et) ? fp.O.some(et === e.type) : fp.O.none,
      ),
      fp.O.alt(() =>
        Schema.is(Schema.Array(EventType))(eventType)
          ? fp.O.some(eventType.includes(e.type))
          : fp.O.none,
      ),
      fp.O.getOrElse(() => true),
    );

    if (!isTypeIncluded) {
      return fp.E.left(`${e.id} type ${e.type} not included in ${eventType}`);
    }

    return fp.E.right(e);
  };

export interface TransformNetworkOutputProps {
  startDate: Date;
  endDate: Date;
  ids?: readonly string[];
  type: string;
  eventType?: string | readonly string[];
  selectedActorIds?: readonly UUID[];
  selectedGroupIds?: readonly UUID[];
  selectedKeywordIds?: readonly UUID[];
  count?: number;
}

export const transformNetworkOutput = (
  graph: NetworkGraphOutput,
  props: TransformNetworkOutputProps,
): {
  graph: {
    nodes: (
      | EventNetworkNodeProps
      | ActorNetworkNodeProps
      | GroupNetworkNodeProps
      | KeywordNetworkNodeProps
    )[];
    links: NetworkLink[];
  };
  events: SearchEvent.SearchEvent[];
  actors: Actor.Actor[];
  groups: Group.Group[];
  keywords: Keyword.Keyword[];
  minDate: Date;
  maxDate: Date;
  totals: EventTotals;
} => {
  // console.log("transform network output", props);
  const {
    selectedActorIds,
    selectedGroupIds,
    selectedKeywordIds,
    type: _type,
    ids,
    eventType,
    startDate,
    endDate,
    count,
    ...otherProps
  } = props;

  // console.log({ startDate, endDate });
  const {
    eventLinks,
    actorLinks,
    groupLinks,
    keywordLinks,
    selectedLinks,
    events: _events,
    actors,
    groups,
    keywords,
  } = graph;

  const events = count ? _events.slice(0, count) : _events;

  const minDate = pipe(
    events,
    fp.A.last,
    fp.O.map((d) => (typeof d.date === "string" ? parseISO(d.date) : d.date)),
    fp.O.getOrElse(() => new Date()),
  );
  const maxDate = pipe(
    events,
    fp.A.head,
    fp.O.map((d) => (typeof d.date === "string" ? parseISO(d.date) : d.date)),
    fp.O.getOrElse(() => new Date()),
  );

  const filteredEvents = events
    .map((e) => {
      const date = typeof e.date === "string" ? parseISO(e.date) : e.date;
      const min = differenceInDays(date, startDate);

      if (min < 0) {
        // console.log(`Days to start date ${startDate}`, min);
        return fp.E.left(
          `${e.id} date ${e.date} is less than min date ${startDate}`,
        );
      }

      const max = differenceInDays(endDate, date);

      if (max < 0) {
        // console.log(`Days to endDate date ${endDate}`, max);
        return fp.E.left(
          `${e.id} date ${e.date} is greater than max date ${endDate}`,
        );
      }

      // console.log("e", e);
      const eventRelationIds = getRelationIdsFromEventRelations({
        keywords: e.keywords,
        actors: e.actors,
        groups: e.groups,
        links: [],
        media: [],
        groupsMembers: [],
        areas: [],
      });

      return pipe(
        fp.E.right(e),
        fp.E.chain(isBetweenDates(startDate, endDate)),
        fp.E.chain(hasType(eventType)),
        fp.E.chain(hasKeywords(selectedKeywordIds, eventRelationIds.keywords)),
        fp.E.chain(hasActors(selectedActorIds, eventRelationIds.actors)),
        fp.E.chain(hasGroups(selectedGroupIds, eventRelationIds.groups)),
      );
    })
    .flatMap((res) => {
      if (fp.E.isLeft(res)) {
        // console.log(`Not included:`, res.left);
        return [];
      }

      // console.log(`Included:`, res.right.id);
      return [res.right];
    });

  // console.log("filtered events", filteredEvents);
  const eventIds = filteredEvents.map((e) => e.id);

  // console.log("event ids", eventIds);
  const relationLinks = selectedLinks
    .concat(actorLinks)
    .concat(groupLinks)
    .concat(keywordLinks)
    .filter((l) => eventIds.includes(l.target) || eventIds.includes(l.source));

  // console.log(relationLinks);
  const keywordNodes = toKeywordNodes(keywords, keywordLinks);

  const actorNodes = toActorNodes(actors, actorLinks);

  const groupNodes = toGroupNodes(groups, groupLinks);

  const relationNodes = [...actorNodes, ...groupNodes, ...keywordNodes].filter(
    (r) =>
      relationLinks.some(
        (l) => r.data.id === l.target || r.data.id === l.source,
      ) || ids?.includes(r.data.id),
  );

  const eventNodes = filteredEvents.map((data) => ({ data }));

  const links = eventLinks
    .filter((l) => eventIds.includes(l.target) && eventIds.includes(l.source))
    .concat(relationLinks);

  return {
    ...otherProps,
    events: [],
    actors: [...actors],
    groups: [...groups],
    keywords: [...keywords],
    graph: {
      nodes: [...eventNodes, ...relationNodes],
      links: [...links],
    },
    minDate,
    maxDate,
    totals: graph.totals,
  };
};
