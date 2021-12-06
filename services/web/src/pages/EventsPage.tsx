import {
  Actor,
  Group,
  GroupMember,
  Keyword,
} from "@econnessione/shared/io/http";
import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import { EventsMap } from "@econnessione/ui/components/EventsMap";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@econnessione/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { PageContent } from "@econnessione/ui/components/PageContent";
import { Button, Grid, Tab, Tabs } from "@material-ui/core";
import { formatISO, subYears } from "date-fns";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
// import { resetInfiniteList } from "../state/commands";
import { doUpdateCurrentView, EventsView } from "../utils/location.utils";
import { EventsNetwork } from "@containers/EventsNetwork";
import { EventsPanel } from "@containers/EventsPanel";
import InfiniteEventList from "@containers/InfiniteEventList";

const MIN_DATE = formatISO(subYears(new Date(), 10), {
  representation: "date",
});
const MAX_DATE = formatISO(new Date(), { representation: "date" });

interface EventsPageProps extends EventsView {}

const EventsPage: React.FC<EventsPageProps> = ({
  actors: actorIds = [],
  groups: groupIds = [],
  groupsMembers: groupsMembersIds = [],
  keywords: keywordIds = [],
  startDate = MIN_DATE,
  endDate = MAX_DATE,
  tab = 0,
  hash,
}) => {
  const [dateRange, setDateRange] = React.useState<[string, string]>([
    startDate,
    endDate,
  ]);

  const filters = {
    startDate,
    endDate,
    keywords: keywordIds,
    groups: groupIds,
    actors: actorIds,
    groupsMembers: groupsMembersIds,
    hash,
    tab,
  };

  const handleUpdateCurrentView = React.useCallback(
    (update: Partial<Omit<EventsView, "view">>): void => {
      void doUpdateCurrentView({
        view: "events",
        ...filters,
        ...update,
      })();
    },
    [hash, tab, filters]
  );

  const handleDateRangeChange = React.useCallback(
    (range: [string, string]): void => {
      setDateRange(range);
      handleUpdateCurrentView({
        startDate: range[0],
        endDate: range[1],
      });
    },
    [filters.startDate, filters.endDate]
  );

  const onActorsChange = React.useCallback(
    (actor: Actor.Actor[]): void => {
      handleUpdateCurrentView({
        actors: actor.map((a) => a.id),
      });
    },
    [filters]
  );

  const onGroupsChange = React.useCallback(
    (groups: Group.Group[]): void => {
      handleUpdateCurrentView({
        groups: groups.map((_) => _.id),
      });
    },
    [filters]
  );

  const onGroupMembersChange = React.useCallback(
    (groupMembers: GroupMember.GroupMember[]): void => {
      handleUpdateCurrentView({
        groupsMembers: groupMembers.map((_) => _.id),
      });
    },
    [filters]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: Keyword.Keyword[]): void => {
      handleUpdateCurrentView({
        keywords: keywords.map((k) => k.id),
      });
    },
    [filters]
  );

  return (
    <Grid container  justifyContent="center">
      <Grid item lg={10} style={{ marginBottom: 40 }}>
        <Grid container spacing={2}>
        <Grid item lg={12} md={12} sm={12}>
          <PageContent queries={{ pageContent: { path: "events" } }} />
        </Grid>

        <Grid item lg={2} md={12} sm={12} xs={12}>
          <Grid container spacing={2}>
            <Grid item lg={12} md={6} sm={6} xs={6}>
              <DatePicker
                size="small"
                value={dateRange[0]}
                variant="outlined"
                onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                onBlur={(e) => {
                  handleDateRangeChange([e.target.value, dateRange[1]]);
                }}
                style={{ width: "100%" }}
              />
            </Grid>
            <Grid item lg={12} md={6} sm={6} xs={6}>
              <DatePicker
                size="small"
                value={dateRange[1]}
                variant="outlined"
                onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                onBlur={(e) =>
                  handleDateRangeChange([dateRange[0], e.target.value])
                }
                style={{ width: "100%" }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item lg={10} md={12} sm={12} xs={12}>
          <Grid container spacing={2}>
            <Grid item lg={4} md={6} sm={6} xs={6}>
              <AutocompleteGroupInput
                selectedIds={groupIds}
                onChange={onGroupsChange}
              />
            </Grid>
            <Grid item lg={4} md={6} sm={6} xs={6}>
              <AutocompleteGroupMemberInput
                selectedIds={groupsMembersIds}
                onItemClick={onGroupMembersChange}
              />
            </Grid>
            <Grid item lg={4} md={6} sm={6} xs={6}>
              <AutocompleteActorInput
                selectedIds={actorIds}
                onChange={onActorsChange}
              />
            </Grid>
            <Grid item lg={4} md={6} sm={6} xs={6}>
              <AutocompleteKeywordInput
                selectedIds={keywordIds}
                onItemClick={onKeywordsChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} justifyContent="flex-end">
            <Grid item md={2} sm={6} xs={12}>
              <Button
                fullWidth
                color="secondary"
                variant="contained"
                size="small"
                onClick={() =>
                  handleUpdateCurrentView({
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
        </Grid>
        </Grid>
      </Grid>
      <Grid item lg={10} md={12} sm={12} xs={12} style={{ maxWidth: "100%" }}>
        <EventsPanel
          view={{
            view: "events",
          }}
          tab={tab}
          hash={hash}
          filters={filters}
        />
      </Grid>
    </Grid>
  );
};

export default EventsPage;
