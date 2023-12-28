import { fp } from "@liexp/core/lib/fp";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { ParentSize } from "@visx/responsive";
import { differenceInDays, parseISO } from "date-fns";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { type GetListParams } from "react-admin";
import {
  EventsNetworkGraph,
  type EventsNetworkGraphProps,
} from "../../components/Graph/EventsNetworkGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import EventsAppBar from "../../components/events/filters/EventsAppBar";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "../../components/mui";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import { type SearchEventsQueryInputNoPagination } from "../../state/queries/SearchEventsQuery";
import { type UseListQueryFn } from "../../state/queries/type";

export interface EventNetworkGraphBoxProps
  extends Omit<
    EventsNetworkGraphProps,
    "events" | "actors" | "groups" | "keywords" | "graph" | "width" | "height"
  > {
  count?: number;
  type: NetworkType;
  relations?: NetworkGroupBy[];
  showRelations?: boolean;
  selectedActorIds?: string[];
  selectedGroupIds?: string[];
  selectedKeywordIds?: string[];
  query: Omit<SearchEventsQueryInputNoPagination, "hash">;
  onRelationsChange?: (relations: NetworkGroupBy[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
interface EventNetworkGraphBoxWrapperProps<T extends any>
  extends EventNetworkGraphBoxProps {
  hash: string;
  filters?: (opts: T) => React.ReactNode | null;
  transform: (graph: NetworkGraphOutput, props: EventNetworkGraphBoxProps) => T;
  children: (opts: T & { width: number; height: number }) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const EventsNetworkGraphBoxWrapper = <T extends any>({
  count = 50,
  query: { ids, eventType, ...query },
  type,
  selectedActorIds,
  selectedGroupIds,
  selectedKeywordIds,
  relations: _relations = [KEYWORDS.value],
  onRelationsChange,
  showRelations = true,
  transform,
  ...props
}: EventNetworkGraphBoxWrapperProps<T>): JSX.Element => {
  const Queries = useEndpointQueries();
  const [relations, setRelations] = onRelationsChange
    ? [_relations, onRelationsChange]
    : React.useState(_relations);

  const handleRelationChange = React.useCallback(
    (r: NetworkGroupBy) => (_: any, c: boolean) => {
      setRelations(
        !c ? relations.filter((rr) => rr !== r) : relations.concat(r),
      );
    },
    [relations],
  );

  return (
    <QueriesRenderer
      queries={{
        graph: Queries.Networks.get.useQuery(
          { type },
          {
            ...query,
            relations,
            actors: pipe(
              query.actors,
              fp.O.fromPredicate(t.array(t.string).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            groups: pipe(
              query.groups,
              fp.O.fromPredicate(t.array(t.string).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            keywords: pipe(
              query.keywords,
              fp.O.fromPredicate(t.array(t.string).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            ids: pipe(
              ids,
              fp.O.fromPredicate(t.array(t.string).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
          },
          false,
        ),
      }}
      render={({ graph }) => {
        const innerProps = transform(graph, {
          query: {
            ...query,
            ids,
            eventType,
          },
          type,
          selectedActorIds,
          selectedGroupIds,
          selectedKeywordIds,
        });

        return (
          <Box
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {props.filters ? (
              <Box
                style={{
                  display: "flex",
                  width: "100%",
                  flexShrink: 1,
                  height: "20%",
                }}
              >
                {props.filters(innerProps)}
              </Box>
            ) : null}

            <Box
              style={{
                display: "flex",
                width: "100%",
                height: props.filters ? "80%" : "100%",
                // flexGrow: 1
              }}
            >
              <ParentSize debounceTime={1000}>
                {({ width, height }) => {
                  return props.children({
                    ...props,
                    ...(innerProps as any),
                    width,
                    height,
                  });
                }}
              </ParentSize>
              {showRelations ? (
                <Box
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: 16,
                  }}
                >
                  <FormControlLabel
                    label={<Typography variant="caption">Actors</Typography>}
                    control={
                      <Checkbox
                        checked={relations.includes(ACTORS.value)}
                        onChange={handleRelationChange(ACTORS.value)}
                      />
                    }
                  />
                  <FormControlLabel
                    label={<Typography variant="caption">Groups</Typography>}
                    control={
                      <Checkbox
                        checked={relations.includes(GROUPS.value)}
                        onChange={handleRelationChange(GROUPS.value)}
                      />
                    }
                  />
                  <FormControlLabel
                    label={<Typography variant="caption">Keywords</Typography>}
                    control={
                      <Checkbox
                        checked={relations.includes(KEYWORDS.value)}
                        onChange={handleRelationChange(KEYWORDS.value)}
                      />
                    }
                  />
                </Box>
              ) : null}
            </Box>
          </Box>
        );
      }}
    />
  );
};

const transformNetworkOutput = (
  graph: NetworkGraphOutput,
  props: EventNetworkGraphBoxProps,
): Omit<EventsNetworkGraphProps, "width" | "height"> & {
  minDate: Date;
  maxDate: Date;
  totals: EventTotals;
} => {
  // console.log("transform network output", props);
  const {
    selectedActorIds,
    selectedGroupIds,
    selectedKeywordIds,
    type,
    query: { ids, eventType, ...query },
    ...otherProps
  } = props;

  const startDate = parseISO(query.startDate ?? graph.startDate.toISOString());
  const endDate = parseISO(query.endDate ?? graph.endDate.toISOString());

  // console.log({ startDate, endDate });
  const {
    eventLinks,
    actorLinks,
    groupLinks,
    keywordLinks,
    selectedLinks,
    events,
    actors,
    groups,
    keywords,
  } = graph;

  const minDate =
    events.length > 0 ? events.at(events.length - 1).date : new Date();
  const maxDate = events.length > 0 ? events.at(0).date : new Date();

  // console.log({ minDate, maxDate });
  const filteredEvents = events
    .map((e) => {
      const date = parseISO(e.date);
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
      const eventRelations = getRelationIds(e);
      // console.log("event relations", eventRelations);
      if (selectedActorIds && selectedActorIds.length > 0) {
        // console.log("filter per actors", eventRelations.actors);
        const hasActor = eventRelations.actors.some((a: any) =>
          (selectedActorIds ?? []).includes(a),
        );
        if (!hasActor) {
          // console.log("no actors found", selectedActorIds);
          return fp.E.left(
            `${e.id} has no actors ${selectedActorIds} in ${eventRelations.actors}`,
          );
        }
      }

      if (selectedGroupIds && selectedGroupIds.length > 0) {
        // console.log("filter per groups", selectedGroupIds);
        const hasGroup = eventRelations.groups.some((a) =>
          (selectedGroupIds ?? []).includes(a),
        );
        if (!hasGroup) {
          // console.log("no groups found", selectedGroupIds);
          return fp.E.left(
            `${e.id} has no groups ${selectedGroupIds} in ${eventRelations.groups}`,
          );
        }
      }

      if (selectedKeywordIds && selectedKeywordIds.length > 0) {
        const eventKeywordIds = eventRelations.keywords.map(
          (a: any): UUID => a.id,
        );
        const hasKeyword = eventKeywordIds.some((a) =>
          (selectedKeywordIds ?? []).includes(a),
        );

        if (!hasKeyword) {
          return fp.E.left(
            `${
              e.id
            } has no keywords ${selectedKeywordIds} in ${eventKeywordIds.join(
              ", ",
            )}`,
          );
        }
      }

      // console.log("query type", queryType);
      const isTypeIncluded: boolean = pipe(
        eventType,
        fp.O.fromNullable,
        fp.O.chain((et) =>
          EventType.is(et) ? fp.O.some(et === e.type) : fp.O.none,
        ),
        fp.O.alt(() =>
          t.array(EventType).is(eventType)
            ? fp.O.some(eventType.includes(e.type))
            : fp.O.none,
        ),
        fp.O.getOrElse(() => true),
      );

      if (!isTypeIncluded) {
        return fp.E.left(`${e.id} type ${e.type} not included in ${eventType}`);
      }

      return fp.E.right(e);
    })
    .flatMap((res) => {
      if (fp.E.isLeft(res)) {
        // console.log(`Not included:`, res.left);
        return [];
      }
      return [res.right];
    });

  // console.log(filteredEvents);

  const eventIds = filteredEvents.map((e) => e.id);

  // console.log("event ids", eventIds);

  const relationLinks = selectedLinks
    .concat(actorLinks)
    .concat(groupLinks)
    .concat(keywordLinks)
    .filter((l) => eventIds.includes(l.target) || eventIds.includes(l.source));

  // console.log(relationLinks);

  const keywordNodes = keywords.map((k) => ({
    ...k,
    type: KEYWORDS.value,
    count: keywordLinks.filter((kk) => kk.source === k.id || kk.target === k.id)
      .length,
  }));

  const actorNodes = actors.map((a): any => ({
    ...a,
    type: ACTORS.value,
    count: actorLinks.filter((kk) => kk.source === a.id || kk.target === a.id)
      .length,
  }));

  const groupNodes = groups.map((g) => ({
    ...g,
    type: GROUPS.value,
    count: groupLinks.filter((kk) => kk.source === g.id || kk.target === g.id)
      .length,
  }));

  const relationNodes = actorNodes
    .concat(groupNodes)
    .concat(keywordNodes)
    .filter(
      (r) =>
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        relationLinks.some((l) => r.id === l.target || r.id === l.source) ||
        ids?.includes(r.id),
    );

  const nodes = filteredEvents.concat(relationNodes);

  const links = eventLinks
    .filter((l) => eventIds.includes(l.target) && eventIds.includes(l.source))
    .concat(relationLinks);

  return {
    ...otherProps,
    events: filteredEvents,
    actors,
    groups,
    keywords,
    graph: { nodes: [...nodes], links: [...links] },
    minDate: parseISO(minDate),
    maxDate: parseISO(maxDate),
    totals: graph.totals,
  };
};

export const EventsNetworkGraphBox: React.FC<EventNetworkGraphBoxProps> = ({
  query,
  ...props
}) => {
  const hash = `event-network-graph-box`;

  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <EventsNetworkGraphBoxWrapper
        {...props}
        query={{ ...query }}
        transform={transformNetworkOutput}
        hash={hash}
      >
        {({ width, height, ...otherProps }: EventsNetworkGraphProps) => {
          // console.log("events network props", { ...otherProps });

          // return <div style={{ width, height: 600, background: "red" }} />;
          return (
            <EventsNetworkGraph width={width} height={height} {...otherProps} />
          );
        }}
      </EventsNetworkGraphBoxWrapper>
    </Box>
  );
};

interface EventNetworkGraphBoxWithFiltersProps
  extends Omit<EventNetworkGraphBoxProps, "relations" | "onRelationsChange"> {
  relations?: NetworkGroupBy[];
  onRelationsChange?: (relations: NetworkGroupBy[]) => void;
  showFilter?: boolean;
  onQueryChange: (q: SearchEventsQueryInputNoPagination) => void;
}

export const EventNetworkGraphBoxWithFilters: React.FC<
  EventNetworkGraphBoxWithFiltersProps
> = ({
  count = 50,
  query,
  type,
  showFilter = true,
  onQueryChange,
  ...props
}) => {
  const state = React.useMemo(
    () => ({
      startDate: query.startDate,
      eventType: query.eventType ?? EventType.types.map((t) => t.value),
      endDate: query.endDate,
      selectedActorIds: props.selectedActorIds ?? [],
      selectedGroupIds: props.selectedGroupIds ?? [],
      selectedKeywordIds: props.selectedKeywordIds ?? [],
    }),
    [query],
  );

  return (
    <Box
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <EventsNetworkGraphBoxWrapper
        {...props}
        hash={"event-network-graph-box-wrapper"}
        query={{
          ...query,
          eventType: state.eventType,
          startDate: state.startDate,
          endDate: state.endDate,
        }}
        type={type}
        transform={transformNetworkOutput}
        selectedActorIds={state.selectedActorIds}
        selectedGroupIds={state.selectedGroupIds}
        selectedKeywordIds={state.selectedKeywordIds}
        filters={({
          actors,
          events,
          totals,
          groups,
          keywords,
          minDate,
          maxDate,
        }) => {
          return (
            <EventsAppBar
              layout={{
                eventTypes: 4,
                dateRangeBox: { columns: 8, variant: "slider" },
                relations: 3,
              }}
              events={events}
              totals={totals}
              query={{
                hash: "",
                ...query,
                eventType: state.eventType,
                startDate: minDate.toISOString(),
                endDate: maxDate.toISOString(),
              }}
              dateRange={[minDate, maxDate]}
              keywords={keywords.map((k) => ({
                ...k,
                selected: state.selectedKeywordIds.includes(k.id),
              }))}
              actors={actors.map((a) => ({
                ...a,
                selected: state.selectedActorIds.includes(a.id),
              }))}
              groups={groups.map((g) => ({
                ...g,
                selected: state.selectedGroupIds.includes(g.id),
              }))}
              groupsMembers={[]}
              onQueryChange={(q) => {
                onQueryChange(q);
              }}
              onQueryClear={() => {
                onQueryChange({
                  eventType: undefined,
                  startDate: query.startDate,
                  endDate: query.endDate,
                  actors: [],
                  groups: [],
                  keywords: [],
                  hash: "",
                });
              }}
            />
          );
        }}
      >
        {({
          actors,
          groups,
          keywords,
          totals,
          events,
          minDate,
          maxDate,
          width,
          height,
          ...otherProps
        }) => {
          // console.log("events network graph props", { ...otherProps });
          return (
            <EventsNetworkGraph
              {...otherProps}
              width={width}
              height={height}
              events={events}
              actors={actors}
              groups={groups}
              keywords={keywords}
            />
          );
        }}
      </EventsNetworkGraphBoxWrapper>
    </Box>
  );
};

interface EventsNetworkGraphBoxWithQueryProps
  extends Omit<EventNetworkGraphBoxProps, "id" | "query"> {
  useQuery: UseListQueryFn<any>;
  params: Partial<GetListParams>;
  eventsBoxQuery: any;
}

export const EventsNetworkGraphBoxWithQuery: React.FC<
  EventsNetworkGraphBoxWithQueryProps
> = ({ useQuery, params, eventsBoxQuery: query, ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        items: useQuery(params, {}, false),
      }}
      render={({ items: { data } }) => {
        return (
          <EventsNetworkGraphBox
            {...props}
            query={{ ...query, ids: [data[0].id], id: data[0].id }}
          />
        );
      }}
    />
  );
};
