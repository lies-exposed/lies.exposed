import { GetSearchEventsQueryInput } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@liexp/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from "@liexp/ui/components/Input/AutocompleteKeywordInput";
import { SearchEventQueryResult } from "@liexp/ui/state/queries/SearchEventsQuery";
import { Button, Grid } from "@material-ui/core";
import * as React from "react";

interface EventsFilterProps
  extends Omit<SearchEventQueryResult, "events" | "total" | "totals"> {
  queryFilters: Partial<GetSearchEventsQueryInput>;
  onQueryChange: (f: Partial<GetSearchEventsQueryInput>) => void;
  onQueryClear: () => void;
}

const EventsFilter: React.FC<EventsFilterProps> = ({
  queryFilters,
  actors,
  groups,
  groupsMembers,
  keywords,
  onQueryChange,
  onQueryClear,
}) => {
  return (
    <Grid
      container
      style={{ padding: 0, margin: 0, width: "100%" }}
      spacing={2}
    >
      <Grid item xs={12}>
        <AutocompleteKeywordInput
          selectedItems={keywords}
          onItemClick={(kk) => {
            onQueryChange({
              ...queryFilters,
              keywords: kk.map((k) => k.id),
            });
          }}
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
          onClick={() => onQueryClear()}
        >
          Clear filters
        </Button>
      </Grid>
    </Grid>
  );
};

export default EventsFilter;
