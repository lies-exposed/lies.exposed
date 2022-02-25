import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import {
  SearchEventQueryInput,
  searchEventsQuery,
} from "@liexp/ui/state/queries/SearchEventsQuery";
import { Box, IconButton, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

export interface EventsTotalsProps {
  query: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
  hash: string;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
    patents: boolean;
  };
  appBarClassName: string;
  onFilterChange: (f: EventsTotalsProps["filters"]) => void;
}

const EventsTotals: React.FC<EventsTotalsProps> = ({
  query,
  hash,
  filters,
  onFilterChange,
  appBarClassName,
}) => {
  return (
    <WithQueries
      queries={{ searchEvents: searchEventsQuery }}
      params={{
        searchEvents: {
          ...query,
          hash,
          _start: 0,
          _end: 0,
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ searchEvents: { totals } }) => {
          const totalEvents = Object.entries(totals).reduce(
            (acc, [, tot]) => acc + tot,
            0
          );
          return (
            <Box width="100%">
              <Box display="flex">
                <IconButton
                  color="primary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      uncategorized: !filters.uncategorized,
                    });
                  }}
                >
                  <EventIcon type="Uncategorized" style={{ marginRight: 10 }} />
                  <Typography variant="caption">
                    {totals.uncategorized}
                  </Typography>
                </IconButton>
                <IconButton
                  color="primary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      deaths: !filters.deaths,
                    });
                  }}
                >
                  <EventIcon type="Death" style={{ marginRight: 10 }} />
                  <Typography variant="caption">{totals.deaths}</Typography>
                </IconButton>
                <IconButton
                  color="primary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      scientificStudies: !filters.scientificStudies,
                    });
                  }}
                >
                  <EventIcon
                    type="ScientificStudy"
                    style={{ marginRight: 10 }}
                  />
                  <Typography variant="caption">
                    {totals.scientificStudies}
                  </Typography>
                </IconButton>
                <IconButton
                  color="primary"
                  style={{ marginRight: 10 }}
                  onClick={() => {
                    onFilterChange({
                      ...filters,
                      patents: !filters.patents,
                    });
                  }}
                >
                  <EventIcon type="Patent" style={{ marginRight: 10 }} />
                  <Typography variant="caption">{totals.patents}</Typography>
                </IconButton>
                <Typography
                  display="inline"
                  variant="h5"
                  color="secondary"
                  style={{
                    margin: "auto",
                    marginRight: 0,
                  }}
                >
                  {totalEvents}
                </Typography>
              </Box>
            </Box>
          );
        }
      )}
    />
  );
};

export default EventsTotals;
