import { fp } from "@liexp/core/lib/fp";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/event";
import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { EventType } from "@liexp/shared/lib/io/http/Events";
import { DEATH } from "@liexp/shared/lib/io/http/Events/Death";
import { DOCUMENTARY } from "@liexp/shared/lib/io/http/Events/Documentary";
import { PATENT } from "@liexp/shared/lib/io/http/Events/Patent";
import { QUOTE } from "@liexp/shared/lib/io/http/Events/Quote";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/SearchEventsQuery";
import { TRANSACTION } from "@liexp/shared/lib/io/http/Events/Transaction";
import { UNCATEGORIZED } from "@liexp/shared/lib/io/http/Events/Uncategorized";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword";
import {
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network";
import { parseDate } from "@liexp/shared/lib/utils/date";
import { ParentSize } from "@visx/responsive";
import { differenceInDays, parseISO } from "date-fns";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as React from "react";
import { type GetListParams } from "react-admin";
import {
  EventsNetworkGraph,
  type EventsNetworkGraphProps,
} from "../../components/Graph/EventsNetworkGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import EventsAppBar from "../../components/events/EventsAppBar";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "../../components/mui";
import { type SearchEventsQueryInputNoPagination } from "../../state/queries/SearchEventsQuery";
import { useNetworkGraphQuery } from "../../state/queries/network.queries";
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
  query: Omit<
    SearchEventsQueryInputNoPagination,
    "hash" | "startDate" | "endDate"
  > & {
    startDate: string;
    endDate: string;
  };
  onRelationsChange?: (relations: NetworkGroupBy[]) => void;
}

const EventNetworkGraphBoxWrapper: React.FC<
  EventNetworkGraphBoxProps & {
    hash: string;
    filters?: (
      opts: Omit<EventsNetworkGraphProps, "width" | "height"> & {
        minDate: Date;
        maxDate: Date;
        totals: EventTotals;
      }
    ) => React.ReactNode | null;
    children: (
      opts: EventsNetworkGraphProps & {
        minDate: Date;
        maxDate: Date;
        totals: EventTotals;
      }
    ) => React.ReactNode;
  }
> = ({
  count = 50,
  query: { ids, type: queryType, ...query },
  type,
  selectedActorIds,
  selectedGroupIds,
  selectedKeywordIds,
  relations: _relations = [KEYWORDS.value],
  onRelationsChange,
  showRelations = true,
  ...props
}) => {
  const startDate = parseDate(query.startDate);
  const endDate = parseDate(query.endDate);

  const [relations, setRelations] = onRelationsChange
    ? [_relations, onRelationsChange]
    : React.useState(_relations);

  const handleRelationChange = (r: NetworkGroupBy) => (_: any, c: boolean) => {
    setRelations(!c ? relations.filter((rr) => rr !== r) : relations.concat(r));
  };
  return (
    <Box style={{ height: "100%" }}>
      <QueriesRenderer
        queries={{
          graph: useNetworkGraphQuery(
            { type },
            {
              ...query,
              relations,
              actors: pipe(
                query.actors,
                fp.O.fromPredicate(
                  (ids): ids is string[] => (ids?.length ?? 0) > 0
                ),
                fp.O.chain(fp.NEA.fromArray),
                fp.O.toNullable
              ),
              groups: pipe(
                query.groups,
                fp.O.fromPredicate(
                  (ids): ids is string[] => (ids?.length ?? 0) > 0
                ),
                fp.O.chain(fp.NEA.fromArray),
                fp.O.toNullable
              ),
              keywords: pipe(
                query.keywords,
                fp.O.fromPredicate(
                  (ids): ids is string[] => (ids?.length ?? 0) > 0
                ),
                fp.O.chain(fp.NEA.fromArray),
                fp.O.toNullable
              ),
              ids: pipe(
                ids,
                fp.O.fromPredicate(
                  (ids): ids is string[] => (ids?.length ?? 0) > 0
                ),
                fp.O.chain(fp.NEA.fromArray),
                fp.O.toNullable
              ),
            }
          ),
        }}
        render={({
          graph: {
            eventLinks,
            actorLinks,
            groupLinks,
            keywordLinks,
            selectedLinks,
            events,
            actors,
            groups,
            keywords,
          },
        }) => {
          const minDate = events.at(events.length - 1).date;
          const maxDate = events.at(0).date;

          const filteredEvents = events.filter((e) => {
            const date = parseISO(e.date);
            const min = differenceInDays(date, startDate);

            if (min < 0) {
              // console.log(`Days to start date ${startDate}`, min);
              return false;
            }

            const max = differenceInDays(endDate, date);

            if (max < 0) {
              // console.log(`Days to endDate date ${endDate}`, max);
              return false;
            }

            // console.log("e", e);
            const eventRelations = getRelationIds(e);
            // console.log("event relations", eventRelations);
            if (selectedActorIds && selectedActorIds.length > 0) {
              // console.log("filter per actors", eventRelations.actors);
              const hasActor = eventRelations.actors.some((a: any) =>
                (selectedActorIds ?? []).includes(a)
              );
              if (!hasActor) {
                // console.log("no actors found", selectedActorIds);
                return false;
              }
            }

            if (selectedGroupIds && selectedGroupIds.length > 0) {
              // console.log("filter per groups", selectedGroupIds);
              const hasGroup = eventRelations.groups.some((a: any) =>
                (selectedGroupIds ?? []).includes(a.id)
              );
              if (!hasGroup) {
                // console.log("no groups found", selectedGroupIds);
                return false;
              }
            }

            if (selectedKeywordIds && selectedKeywordIds.length > 0) {
              // console.log("filter per keywords", selectedKeywordIds);
              // console.log("event keywords", eventRelations.keywords);
              const hasKeyword = eventRelations.keywords.some((a: any) =>
                (selectedKeywordIds ?? []).includes(a.id)
              );
              if (!hasKeyword) {
                // console.log("no keywords found", query.keywords);
                return false;
              }
            }

            // console.log("query type", queryType);
            const isTypeIncluded: boolean = pipe(
              queryType,
              fp.O.fromNullable,
              fp.O.chain((et) =>
                t.string.is(et) ? fp.O.some(et === e.type) : fp.O.none
              ),
              fp.O.alt(() =>
                t.array(t.string).is(queryType)
                  ? fp.O.some(queryType.includes(e.type))
                  : fp.O.none
              ),
              fp.O.getOrElse(() => true)
            );

            // console.log("is type included", isTypeIncluded);

            if (!isTypeIncluded) {
              return false;
            }

            return true;
          });

          // console.log(filteredEvents);

          const eventIds = filteredEvents.map((e) => e.id);

          // console.log("event ids", eventIds);

          const relationLinks = selectedLinks
            .concat(actorLinks)
            .concat(groupLinks)
            .concat(keywordLinks)
            .filter(
              (l) => eventIds.includes(l.target) || eventIds.includes(l.source)
            );

          // console.log(relationLinks);

          const relationNodes = actors
            .map((a): any => ({ ...a, type: ACTORS.value }))
            .concat(groups.map((g) => ({ ...g, type: GROUPS.value })))
            .concat(keywords.map((k) => ({ ...k, type: KEYWORDS.value })))
            .filter(
              (r) =>
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                relationLinks.some(
                  (l) => r.id === l.target || r.id === l.source
                ) || ids?.includes(r.id)
            );

          const nodes = filteredEvents.concat(relationNodes);

          const links = eventLinks
            .filter(
              (l) => eventIds.includes(l.target) && eventIds.includes(l.source)
            )
            .concat(relationLinks);

          // console.log({ nodes, links });

          const totals = events.reduce(
            (acc, e) => {
              // console.log(e.type);
              return {
                uncategorized:
                  acc.uncategorized + (UNCATEGORIZED.is(e.type) ? 1 : 0),
                scientificStudies:
                  acc.scientificStudies + (SCIENTIFIC_STUDY.is(e.type) ? 1 : 0),
                transactions:
                  acc.transactions + (TRANSACTION.is(e.type) ? 1 : 0),
                patents: acc.patents + (PATENT.is(e.type) ? 1 : 0),
                deaths: acc.deaths + (DEATH.is(e.type) ? 1 : 0),
                documentaries:
                  acc.documentaries + (DOCUMENTARY.is(e.type) ? 1 : 0),
                quotes: acc.quotes + (QUOTE.is(e.type) ? 1 : 0),
              };
            },
            {
              uncategorized: 0,
              transactions: 0,
              patents: 0,
              deaths: 0,
              documentaries: 0,
              quotes: 0,
              scientificStudies: 0,
            }
          );

          const innerProps = {
            events: filteredEvents,

            actors,
            groups,
            keywords,
            graph: { nodes: [...nodes], links: [...links] },
            totals,
            minDate: parseISO(minDate),
            maxDate: parseISO(maxDate),
          };

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
                    height: "30%",
                  }}
                >
                  {props.filters({ ...innerProps })}
                </Box>
              ) : null}

              <Box
                style={{
                  display: "flex",
                  width: "100%",
                  height: props.filters ? "70%" : "100%",
                  // flexGrow: 1
                }}
              >
                <ParentSize debounceTime={1000}>
                  {({ width, height }) => {
                    return props.children({
                      ...props,
                      ...innerProps,
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
                      label={
                        <Typography variant="caption">Keywords</Typography>
                      }
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
    </Box>
  );
};

export const EventNetworkGraphBox: React.FC<EventNetworkGraphBoxProps> = ({
  query,
  ...props
}) => {
  const hash = `event-network-graph-box`;
  return (
    <Box style={{ width: "100%", height: "100%" }}>
      <EventNetworkGraphBoxWrapper {...props} query={{ ...query }} hash={hash}>
        {({ width, height, ...otherProps }) => {
          // console.log({ width, height });

          // return <div style={{ width, height: 600, background: "red" }} />;
          return (
            <EventsNetworkGraph width={width} height={height} {...otherProps} />
          );
        }}
      </EventNetworkGraphBoxWrapper>
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
  const [state, setState] = React.useState<{
    startDate: string;
    endDate: string;
    type: string[] | string | undefined;
    selectedActorIds: string[];
    selectedGroupIds: string[];
    selectedKeywordIds: string[];
  }>({
    startDate: query.startDate,
    type: query.type ?? EventType.types.map((t) => t.value),
    endDate: query.endDate,
    selectedActorIds: props.selectedActorIds ?? [],
    selectedGroupIds: props.selectedGroupIds ?? [],
    selectedKeywordIds: props.selectedKeywordIds ?? [],
  });

  return (
    <Box
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
      }}
    >
      <EventNetworkGraphBoxWrapper
        {...props}
        hash={"event-network-graph-box-wrapper"}
        query={{
          ...query,
          type: state.type,
          startDate: state.startDate,
          endDate: state.endDate,
        }}
        type={type}
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
              layout={{ dateRangeBox: { columns: 12, variant: "slider" } }}
              events={events}
              totals={totals}
              query={{
                hash: "",
                ...query,
                type: state.type,
                actors: state.selectedActorIds,
                startDate: state.startDate,
                endDate: state.endDate,
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
                setState((s) => ({
                  ...s,
                  type: q.type,
                  startDate: q.startDate ?? state.startDate,
                  endDate: q.endDate ?? state.endDate,
                  selectedActorIds: q.actors ?? [],
                  selectedGroupIds: q.groups ?? [],
                  selectedKeywordIds: q.keywords ?? [],
                }));
              }}
              onQueryClear={() => {
                setState({
                  type: undefined,
                  startDate: query.startDate,
                  endDate: query.endDate,
                  selectedActorIds: props.selectedActorIds ?? [],
                  selectedGroupIds: props.selectedGroupIds ?? [],
                  selectedKeywordIds: props.selectedKeywordIds ?? [],
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
          // console.log({ width, height });
          // return <div style={{ width, height, background: "red" }} />;
          return (
            <EventsNetworkGraph
              {...otherProps}
              width={width}
              height={height}
              events={events}
              selectedActorIds={state.selectedActorIds}
              selectedGroupIds={state.selectedGroupIds}
              selectedKeywordIds={state.selectedKeywordIds}
              actors={actors}
              groups={groups}
              keywords={keywords}
            />
          );
        }}
      </EventNetworkGraphBoxWrapper>
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
        items: useQuery(params, false),
      }}
      render={({ items: { data } }) => {
        return (
          <EventNetworkGraphBox
            {...props}
            query={{ ...query, ids: [data[0].id], id: data[0].id }}
          />
        );
      }}
    />
  );
};
