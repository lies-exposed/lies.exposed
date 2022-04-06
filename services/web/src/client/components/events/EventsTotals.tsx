import { Documentary } from "@liexp/shared/io/http/Events";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { getTotal } from "@liexp/ui/helpers/event.helper";
import {
  SearchEventQueryInput,
  searchEventsQuery,
} from "@liexp/ui/state/queries/SearchEventsQuery";
import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import clsx from "clsx";
import * as React from "react";

const useStyles = makeStyles((theme) => ({
  iconButton: {
    marginRight: 10,
  },
  iconButtonSelected: {
    background: theme.palette.grey[200],
  },
}));

export interface EventsTotalsProps {
  query: Omit<SearchEventQueryInput, "hash" | "_start" | "_end">;
  hash: string;
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
    patents: boolean;
    documentaries: boolean;
    transactions: boolean;
  };
  onFilterChange: (f: EventsTotalsProps["filters"]) => void;
}

const EventsTotals: React.FC<EventsTotalsProps> = ({
  query,
  hash,
  filters,
  onFilterChange,
}) => {
  const classes = useStyles();

  return (
    <QueriesRenderer
      queries={{
        searchEvents: searchEventsQuery({
          ...query,
          hash,
          _start: 0,
          _end: 0,
        }),
      }}
      render={({ searchEvents: { totals } }) => {
        const totalEvents = getTotal(totals, filters);
        return (
          <Box width="100%">
            <Box display="flex">
              <IconButton
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.uncategorized,
                })}
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
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.deaths,
                })}
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
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.scientificStudies,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    scientificStudies: !filters.scientificStudies,
                  });
                }}
              >
                <EventIcon type="ScientificStudy" style={{ marginRight: 10 }} />
                <Typography variant="caption">
                  {totals.scientificStudies}
                </Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.documentaries,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    documentaries: !filters.documentaries,
                  });
                }}
              >
                <EventIcon
                  type={Documentary.DOCUMENTARY.value}
                  style={{ marginRight: 10 }}
                />
                <Typography variant="caption">
                  {totals.documentaries}
                </Typography>
              </IconButton>
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.patents,
                })}
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
              <IconButton
                color="primary"
                className={clsx(classes.iconButton, {
                  [classes.iconButtonSelected]: filters.transactions,
                })}
                onClick={() => {
                  onFilterChange({
                    ...filters,
                    transactions: !filters.transactions,
                  });
                }}
              >
                <EventIcon type="Transaction" style={{ marginRight: 10 }} />
                <Typography variant="caption">{totals.transactions}</Typography>
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
      }}
    />
  );
};

export default EventsTotals;
