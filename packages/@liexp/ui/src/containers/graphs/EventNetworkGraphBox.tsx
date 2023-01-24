import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { type GetNetworkQuery, type NetworkType } from "@liexp/shared/io/http/Network";
import { formatDate } from "@liexp/shared/utils/date";
import { ParentSize } from "@visx/responsive";
import subWeeks from "date-fns/subWeeks";
import { type UUID } from "io-ts-types/UUID";
import * as React from "react";
import { type serializedType } from "ts-io-error/lib/Codec";
import { DateRangePicker } from "../../components/Common/DateRangePicker";
import {
  EventsNetworkGraph,
  type EventsNetworkGraphProps,
} from "../../components/Graph/EventsNetworkGraph";
import QueriesRenderer from "../../components/QueriesRenderer";
import { Box, MenuItem, Select } from "../../components/mui";
import { useNetworkGraphQuery } from "../../state/queries/DiscreteQueries";

export interface EventNetworkGraphBoxProps
  extends Omit<
    EventsNetworkGraphProps,
    "events" | "actors" | "groups" | "keywords" | "graph" | "width" | "height"
  > {
  count?: number;
  type: NetworkType;
  id: UUID;
  query: Partial<serializedType<typeof GetNetworkQuery>>;
  showFilter?: boolean;
}

export const EventNetworkGraphBox: React.FC<EventNetworkGraphBoxProps> = ({
  count = 50,
  query,
  id,
  type,
  showFilter = true,
  ...props
}) => {
  const [groupBy, setGroupBy] = React.useState<any>(
    query.groupBy ?? KEYWORDS.value
  );
  const [[startDate, endDate], setDateRange] = React.useState<
    [string | undefined, string | undefined]
  >([formatDate(subWeeks(new Date(), 52)), formatDate(new Date())]);

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
              setDateRange([from, to]);
            }}
          />

          <Select
            label={"Group By"}
            value={groupBy}
            size="small"
            onChange={(e) => {
              setGroupBy(e.target.value);
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
            { id, type },
            { ...query, startDate, endDate, groupBy }
          ),
        }}
        render={({ graph }) => {
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
                    graph={graph}
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
