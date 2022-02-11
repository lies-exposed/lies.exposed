import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@econnessione/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { Button, Grid } from "@material-ui/core";
import * as React from "react";
import { EventsView } from "../../utils/location.utils";
import EventsAppBar, { EventsAppBarMinimalProps } from "./EventsAppBar";
import { EventsTotals } from "./EventsTotals";

interface EventsFilterProps extends EventsAppBarMinimalProps {
  onQueryFilterChange: (f: Omit<EventsView, "view">) => void;
}

const EventsFilter: React.FC<EventsFilterProps> = ({
  queryFilters,
  showFilters,
  actors,
  groups,
  groupsMembers,
  keywords,
  filters,
  totals,
  onFilterChange,
  onQueryFilterChange,
}) => {
  const [currentDateRange, setCurrentDateRange] = React.useState([
    queryFilters.startDate,
    queryFilters.endDate,
  ]);

  return (
    <Grid container spacing={2}>
      <EventsAppBar
        showFilters={showFilters}
        queryFilters={queryFilters}
        actors={actors}
        groups={groups}
        keywords={keywords}
        groupsMembers={groupsMembers}
        filters={filters}
        totals={totals}
        onFilterChange={onFilterChange}
      >
        <Grid container spacing={2} style={{ padding: 0 }}>
          <Grid item lg={2} md={6} sm={6} xs={6}>
            <DatePicker
              size="small"
              value={currentDateRange[0]}
              variant="outlined"
              datatype="date"
              onChange={(e) =>
                setCurrentDateRange([e.target.value, currentDateRange[1]])
              }
              onBlur={(e) => {
                onQueryFilterChange({
                  ...queryFilters,
                  startDate: e.target.value,
                  endDate: currentDateRange[1],
                });
              }}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item lg={2} md={6} sm={6} xs={6}>
            <DatePicker
              size="small"
              value={currentDateRange[1]}
              variant="outlined"
              onChange={(e) =>
                setCurrentDateRange([currentDateRange[0], e.target.value])
              }
              onBlur={(e) =>
                onQueryFilterChange({
                  ...queryFilters,
                  startDate: currentDateRange[1],
                  endDate: e.target.value,
                })
              }
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item lg={8} md={6} sm={6} xs={6}>
            <AutocompleteKeywordInput
              selectedItems={keywords}
              onItemClick={(kk) =>
                onQueryFilterChange({
                  ...queryFilters,
                  keywords: kk.map((k) => k.id),
                })
              }
            />
          </Grid>

          <Grid item lg={4} md={6} sm={6} xs={6}>
            <AutocompleteActorInput
              selectedItems={actors}
              onChange={(aa) =>
                onQueryFilterChange({
                  ...queryFilters,
                  actors: aa.map((a) => a.id),
                })
              }
            />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={6}>
            <AutocompleteGroupInput
              selectedItems={groups}
              onChange={(gg) =>
                onQueryFilterChange({
                  ...queryFilters,
                  groups: gg.map((g) => g.id),
                })
              }
            />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={6}>
            <AutocompleteGroupMemberInput
              selectedItems={groupsMembers}
              onItemClick={(gms) =>
                onQueryFilterChange({
                  ...queryFilters,
                  groupsMembers: gms.map((gm) => gm.id),
                })
              }
            />
          </Grid>

          <Grid
            item
            md={12}
            sm={12}
            xs={12}
            style={{
              textAlign: "right",
            }}
          >
            <Button
              color="secondary"
              variant="contained"
              size="small"
              onClick={() =>
                onQueryFilterChange({
                  actors: [],
                  groups: [],
                  groupsMembers: [],
                  keywords: [],
                  tab: 0,
                  startDate: undefined,
                  endDate: undefined,
                  hash: undefined,
                })
              }
            >
              Clear filters
            </Button>
          </Grid>
          <Grid
            item
            sm={12}
            md={12}
            lg={12}
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <EventsTotals
              filters={filters}
              totals={totals}
              onFilterChange={onFilterChange}
            />
          </Grid>
        </Grid>
      </EventsAppBar>
    </Grid>
  );
};

export default EventsFilter;
