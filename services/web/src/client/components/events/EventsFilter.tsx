import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@econnessione/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { SearchEventQueryResult } from "@econnessione/ui/state/queries/SearchEventsQuery";
import { Button, Grid, makeStyles } from "@material-ui/core";
import * as React from "react";
import { EventsView } from "../../utils/location.utils";

const useStyles = makeStyles((theme) => ({
  input: {
    marginBottom: theme.spacing(2),
  },
}));
interface EventsFilterProps
  extends Omit<SearchEventQueryResult, "events" | "totals"> {
  queryFilters: Omit<EventsView, "view">;
  onQueryFilterChange: (f: Omit<EventsView, "view">) => void;
}

const EventsFilter: React.FC<EventsFilterProps> = ({
  queryFilters,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryFilterChange,
}) => {
  const classes = useStyles();

  const [currentDateRange, setCurrentDateRange] = React.useState([
    queryFilters.startDate,
    queryFilters.endDate,
  ]);

  return (
    <Grid container style={{ padding: 0, margin: 0, width: '100%' }} spacing={2}>
      <Grid item md={12} sm={6} xs={6}>
        <DatePicker
          className={classes.input}
          size="small"
          value={currentDateRange[0]}
          variant="standard"
          label="From"
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
      <Grid item md={12} sm={6} xs={6}>
        <DatePicker
          className={classes.input}
          size="small"
          value={currentDateRange[1]}
          variant="standard"
          label="To"
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
      <Grid item xs={12}>
        <AutocompleteKeywordInput
          className={classes.input}
          selectedItems={keywords}
          onItemClick={(kk) =>
            onQueryFilterChange({
              ...queryFilters,
              keywords: kk.map((k) => k.id),
            })
          }
        />
      </Grid>

      <Grid item md={12} sm={6} xs={6}>
        <AutocompleteActorInput
          className={classes.input}
          selectedItems={actors}
          onChange={(aa) =>
            onQueryFilterChange({
              ...queryFilters,
              actors: aa.map((a) => a.id),
            })
          }
        />
      </Grid>
      <Grid item md={12} sm={6} xs={6}>
        <AutocompleteGroupInput
          className={classes.input}
          selectedItems={groups}
          onChange={(gg) =>
            onQueryFilterChange({
              ...queryFilters,
              groups: gg.map((g) => g.id),
            })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <AutocompleteGroupMemberInput
          className={classes.input}
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
    </Grid>
  );
};

export default EventsFilter;
