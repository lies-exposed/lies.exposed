import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import {
  type GetNetworkQuery,
  type NetworkGroupBy,
  type NetworkType,
} from "@liexp/shared/io/http/Network";
import { formatDate } from "@liexp/shared/utils/date";
import { ParentSize } from "@visx/responsive";
import { differenceInDays, parseISO, subWeeks } from "date-fns";
import * as React from "react";
import { type GetListParams } from "react-admin";
import { type serializedType } from "ts-io-error/lib/Codec";
import { DateRangePicker } from "../../components/Common/DateRangePicker";
import {
  EventsNetworkGraph,
  type EventsNetworkGraphProps,
} from "../../components/Graph/EventsNetworkGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import { Box, MenuItem, Select } from "../../components/mui";
import { useNetworkGraphQuery } from "../../state/queries/DiscreteQueries";
import { type UseListQueryFn } from "../../state/queries/type";

export interface EventNetworkGraphBoxProps
  extends Omit<
    EventsNetworkGraphProps,
    "events" | "actors" | "groups" | "keywords" | "graph" | "width" | "height"
  > {
  count?: number;
  type: NetworkType;
  relations?: NetworkGroupBy[];
  query: Partial<serializedType<typeof GetNetworkQuery>>;
  showFilter?: boolean;
}

export const EventNetworkGraphBox: React.FC<EventNetworkGraphBoxProps> = ({
  count = 50,
  query: { ids, startDate: _startDate, endDate: _endDate, ...query },
  type,
  relations: _relations = [KEYWORDS.value],
  showFilter = true,
  ...props
}) => {
  const [relations, setRelation] = React.useState<NetworkGroupBy[]>(_relations);

  const [[startDate, endDate], setDateRange] = React.useState<[string, string]>(
    [
      formatDate(_startDate ? parseISO(_startDate) : subWeeks(new Date(), 4)),
      formatDate(_endDate ? parseISO(_endDate) : new Date()),
    ]
  );

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {showFilter ? (
        <Box style={{ margin: 20, display: "flex", flexDirection: "row" }}>
          <DateRangePicker
            from={startDate}
            to={endDate}
            onDateRangeChange={([from, to]) => {
              setDateRange([from ?? startDate, to ?? endDate]);
            }}
          />

          <Select
            label={"Relation"}
            value={relations.map((id) => id)}
            placeholder="Select.."
            size="small"
            multiple
            onChange={(e) => {
              setRelation((relations) => {
                const idx = relations.findIndex((v) => v === e.target.value);
                if (idx >= 0) {
                  return relations.splice(idx, 1);
                }
                // return relations.concat(...(e.target.value as any[]));
                return typeof e.target.value === "string"
                  ? [e.target.value as any]
                  : e.target.value;
              });
            }}
          >
            <MenuItem value={ACTORS.value}>{ACTORS.value}</MenuItem>
            <MenuItem value={KEYWORDS.value}>{KEYWORDS.value}</MenuItem>
            <MenuItem value={GROUPS.value}>{GROUPS.value}</MenuItem>
          </Select>
        </Box>
      ) : null}

      <QueriesRenderer
        queries={{
          graph: useNetworkGraphQuery(
            { type },
            { ...query, ids, relations, startDate, endDate }
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
            // startDate,
            // endDate,
          },
        }) => {
          const endDateD = parseISO(endDate);
          const startDateD = parseISO(startDate);
          const filteredEvents = events.filter((e) => {
            const date = parseISO(e.date);
            const min = differenceInDays(date, startDateD);
            const max = differenceInDays(endDateD, date);

            // console.log({ min, max });

            return min >= 0 && max >= 0;
          });

          const eventIds = filteredEvents.map((e) => e.id);

          const relationLinks = selectedLinks
            .concat(actorLinks)
            .concat(groupLinks)
            .concat(keywordLinks)
            .filter(
              (l) => eventIds.includes(l.target) || eventIds.includes(l.source)
            );

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

          return (
            <ParentSize
              debounceTime={1000}
              style={{ height: "100%", width: "100%" }}
            >
              {({ width, height }) => {
                return (
                  <EventsNetworkGraph
                    {...props}
                    events={[]}
                    actors={[]}
                    groups={[]}
                    keywords={[]}
                    graph={{ nodes: [...nodes], links: [...links] }}
                    width={width}
                    height={height}
                    scale="all"
                  />
                );
              }}
            </ParentSize>
          );
        }}
      />
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
          <Box style={{ height: 600 }}>
            <EventNetworkGraphBox
              {...props}
              query={{ ...query, ids: [data[0].id] }}
            />
          </Box>
        );
      }}
    />
  );
};
