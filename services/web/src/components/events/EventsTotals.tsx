import { Box, Chip } from "@material-ui/core";
import * as React from "react";

export interface EventsTotalsProps {
  filters: {
    uncategorized: boolean;
    deaths: boolean;
    scientificStudies: boolean;
  };
  totals: {
    uncategorized: number;
    scientificStudies: number;
    deaths: number;
  };
  onFilterChange: (f: EventsTotalsProps["filters"]) => void;
}

export const EventsTotals: React.FC<EventsTotalsProps> = ({
  totals,
  filters,
  onFilterChange,
}) => {
  return (
    <Box>
      <Chip
        label={`Events (${totals.uncategorized})`}
        color="primary"
        variant={filters.uncategorized ? "default" : "outlined"}
        style={{ marginRight: 10 }}
        onClick={() => {
          onFilterChange({
            ...filters,
            uncategorized: !filters.uncategorized,
          });
        }}
      />
      <Chip
        label={`Deaths (${totals.deaths})`}
        color={"secondary"}
        variant={filters.deaths ? "default" : "outlined"}
        style={{ marginRight: 10 }}
        onClick={() => {
          onFilterChange({
            ...filters,
            deaths: !filters.deaths,
          });
        }}
      />
      <Chip
        label={`Science (${totals.scientificStudies})`}
        color={"secondary"}
        variant={filters.scientificStudies ? "default" : "outlined"}
        onClick={() => {
          onFilterChange({
            ...filters,
            scientificStudies: !filters.scientificStudies,
          });
        }}
      />
    </Box>
  );
};
