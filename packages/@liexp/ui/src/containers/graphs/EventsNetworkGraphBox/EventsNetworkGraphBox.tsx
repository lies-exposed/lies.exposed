import { fp } from "@liexp/core/lib/fp/index.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import {
  type GetNetworkQuerySerialized,
  type NetworkGraphOutput,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Actor, Group, Keyword } from "@liexp/shared/lib/io/http/index.js";
import { ParentSize } from "@visx/responsive";
import { parseISO } from "date-fns";
import { type NonEmptyArray } from "fp-ts/lib/NonEmptyArray.js";
import { pipe } from "fp-ts/lib/function.js";
import * as t from "io-ts";
import * as React from "react";
import { type GetListParams } from "react-admin";
import {
  EventsNetworkGraph,
  type EventsNetworkGraphProps,
} from "../../../components/Graph/Network/EventsNetworkGraph.js";
import QueriesRenderer from "../../../components/QueriesRenderer.js";
import EventsAppBar from "../../../components/events/filters/EventsAppBar.js";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
} from "../../../components/mui/index.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { type UseListQueryFn } from "../../../state/queries/type.js";
import {
  type TransformNetworkOutputProps,
  transformNetworkOutput,
} from "./transformNetworkOutput.js";

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
  query: Partial<
    GetNetworkQuerySerialized & {
      eventType: NonEmptyArray<EventType> | undefined;
    }
  >;
  onRelationsChange?: (relations: NetworkGroupBy[]) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
interface EventNetworkGraphBoxWrapperProps<T extends any>
  extends EventNetworkGraphBoxProps {
  hash: string;
  filters?: (opts: T) => React.ReactNode | null;
  transform: (
    graph: NetworkGraphOutput,
    props: TransformNetworkOutputProps,
  ) => T;
  children: (opts: T & { width: number; height: number }) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const EventsNetworkGraphBoxWrapper = <T extends any>({
  count,
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
}: EventNetworkGraphBoxWrapperProps<T>): React.ReactElement => {
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
      queries={(Q) => ({
        graph: Q.Networks.get.useQuery(
          { type },
          {
            ...query,
            relations,
            actors: pipe(
              query.actors,
              fp.O.fromPredicate(Schema.Array(Schema.String).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            groups: pipe(
              query.groups,
              fp.O.fromPredicate(Schema.Array(Schema.String).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            keywords: pipe(
              query.keywords,
              fp.O.fromPredicate(Schema.Array(Schema.String).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
            ids: pipe(
              ids,
              fp.O.fromPredicate(Schema.Array(Schema.String).is),
              fp.O.chain(fp.NEA.fromArray),
              fp.O.toNullable,
            ),
          },
          false,
        ),
      })}
      render={({ graph }) => {
        const startDate = parseISO(
          query.startDate ?? graph.startDate.toISOString(),
        );
        const endDate = parseISO(query.endDate ?? graph.endDate.toISOString());

        const innerProps = transform(graph, {
          startDate,
          endDate,
          ids: ids ?? undefined,
          eventType,
          type,
          count,
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
                        checked={relations.includes(Actor.ACTORS.value)}
                        onChange={handleRelationChange(Actor.ACTORS.value)}
                      />
                    }
                  />
                  <FormControlLabel
                    label={<Typography variant="caption">Groups</Typography>}
                    control={
                      <Checkbox
                        checked={relations.includes(Group.GROUPS.value)}
                        onChange={handleRelationChange(Group.GROUPS.value)}
                      />
                    }
                  />
                  <FormControlLabel
                    label={<Typography variant="caption">Keywords</Typography>}
                    control={
                      <Checkbox
                        checked={relations.includes(Keyword.KEYWORDS.value)}
                        onChange={handleRelationChange(Keyword.KEYWORDS.value)}
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
        {({ width, height, ...otherProps }) => {
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
> = ({ count, query, type, showFilter = true, onQueryChange, ...props }) => {
  const state = React.useMemo(
    () => ({
      startDate: query.startDate,
      eventType:
        query.eventType ??
        (EventType.types.map((t) => t.value) as NonEmptyArray<EventType>),
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
                ids: query.ids ?? [],
                keywords: query.keywords ?? undefined,
                actors: query.actors ?? undefined,
                groups: query.groups ?? undefined,
                relations: query.relations ?? undefined,
                eventType: state.eventType,
                startDate: minDate?.toISOString(),
                endDate: maxDate?.toISOString(),
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
                  startDate: query.startDate ?? undefined,
                  endDate: query.endDate ?? undefined,
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
            query={{
              ...query,
              ids: data[0] ? [data[0].id] : [],
              id: data[0]?.id,
            }}
          />
        );
      }}
    />
  );
};
