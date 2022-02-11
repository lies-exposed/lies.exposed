import { EventIcon } from "@econnessione/ui/components/Common/Icons/EventIcon";
import { EventTotals } from "@econnessione/ui/state/queries/SearchEventsQuery";
import { Box, IconButton, Typography } from "@material-ui/core";
import * as React from "react";
import EventsAppBar, { EventsAppBarMinimalProps } from "./EventsAppBar";

export interface EventsTotalsProps extends Omit<EventsAppBarMinimalProps, 'events' | 'className'> {
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
    patents: boolean;
  };
  totals: EventTotals;
  appBarClassName: string;
  onFilterChange: (f: EventsTotalsProps["filters"]) => void;
}

export const EventsTotals: React.FC<EventsTotalsProps> = ({
  totals,
  filters,
  onFilterChange,
  appBarClassName,
  ...props
}) => {
  const totalEvents = Object.entries(totals).reduce(
    (acc, [, tot]) => acc + tot,
    0
  );

  const totalsBox = (
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
        <Typography variant="caption">{totals.uncategorized}</Typography>
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
        <EventIcon type="ScientificStudy" style={{ marginRight: 10 }} />
        <Typography variant="caption">{totals.scientificStudies}</Typography>
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
  );

  return (
    <EventsAppBar {...props} className={appBarClassName} totals={totals}>
      {totalsBox}
    </EventsAppBar>
  );
};
