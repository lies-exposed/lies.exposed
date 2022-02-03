import { EventsPanel } from "@containers/EventsPanel";
import { APIError } from "@econnessione/shared/providers/api.provider";
import { formatDate } from "@econnessione/shared/utils/date";
import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteGroupMemberInput } from "@econnessione/ui/components/Input/AutocompleteGroupMemberInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { Button, Grid } from "@material-ui/core";
import { available, queryStrict } from "avenger";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { subYears } from "date-fns";
import * as TE from "fp-ts/lib/TaskEither";
import { GetListParams } from "ra-core";
import * as React from "react";
import EventsToolbar from "../components/EventsAppBar";
import { doUpdateCurrentView, EventsView } from "../utils/location.utils";

const MIN_DATE = formatDate(subYears(new Date(), 10));
const MAX_DATE = formatDate(new Date());

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

  const filterActorsParams = {
    pagination: { page: 1, perPage: actorIds.length },
    sort: { field: "updatedAt", order: "DESC" },
    filter: { ids: actorIds },
  };
  const actorsQuery = queryStrict((input: GetListParams) => {
    return input.filter.ids.length === 0
      ? TE.right<APIError, any>({ data: [], total: 0 })
      : Queries.Actor.getList.run(input as any);
  }, available);

  const groupsQuery = queryStrict(
    (input: GetListParams) =>
      input.filter.ids.length === 0
        ? TE.right<APIError, any>({ data: [], total: 0 })
        : Queries.Group.getList.run(input as any),
    available
  );

  const groupsMembersQuery = queryStrict(
    (input: GetListParams) =>
      input.filter.ids.length === 0
        ? TE.right<APIError, { data: any[]; total: number }>({
            data: [],
            total: 0,
          })
        : Queries.GroupMember.getList.run(input as any),
    available
  );

  const keywordsQuery = queryStrict(
    (input: GetListParams) =>
      input.filter.ids.length === 0
        ? TE.right<APIError, { data: any[]; total: number }>({
            data: [],
            total: 0,
          })
        : Queries.Keyword.getList.run(input as any),
    available
  );

  const onActorsChange = React.useCallback(
    (actors: string[]): void => {
      handleUpdateCurrentView({
        actors,
      });

      void actorsQuery.invalidate({
        ...filterActorsParams,
        filter: { ids: actors },
      })();
    },
    [filters]
  );

  const onGroupsChange = React.useCallback(
    (groups: string[]): void => {
      handleUpdateCurrentView({
        groups,
      });
    },
    [filters]
  );

  const onGroupMembersChange = React.useCallback(
    (groupsMembers: string[]): void => {
      handleUpdateCurrentView({
        groupsMembers,
      });
    },
    [filters]
  );

  const onKeywordsChange = React.useCallback(
    (keywords: string[]): void => {
      handleUpdateCurrentView({
        keywords,
      });
    },
    [filters]
  );

  return (
    <WithQueries
      queries={{
        filterActors: actorsQuery,
        filterGroups: groupsQuery,
        filterGroupsMembers: groupsMembersQuery,
        filterKeywords: keywordsQuery,
      }}
      params={{
        filterActors: filterActorsParams,
        filterGroups: {
          pagination: { page: 1, perPage: groupIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupIds },
        },
        filterGroupsMembers: {
          pagination: { page: 1, perPage: groupsMembersIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: groupsMembersIds },
        },
        filterKeywords: {
          pagination: { page: 1, perPage: keywordIds.length },
          sort: { field: "updatedAt", order: "DESC" },
          filter: { ids: keywordIds },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({
          filterActors,
          filterGroups,
          filterGroupsMembers,
          filterKeywords,
        }) => {
          return (
            <Grid container spacing={2} sm={12} justifyContent="center">
              {/* <Grid item lg={12} md={12} sm={12}>
        <PageContent queries={{ pageContent: { path: "events" } }} />
      </Grid> */}

              <Grid
                item
                lg={12}
                md={12}
                sm={12}
                style={{ margin: 20, maxWidth: "100%" }}
              >
                <Grid container spacing={2}>
                  <EventsToolbar
                    actors={filterActors.data}
                    groups={filterGroups.data}
                    keywords={filterKeywords.data}
                  >
                    <Grid container spacing={2} style={{ padding: 20 }}>
                      <Grid item lg={2} md={6} sm={6} xs={6}>
                        <DatePicker
                          size="small"
                          value={dateRange[0]}
                          variant="outlined"
                          onChange={(e) =>
                            setDateRange([e.target.value, dateRange[1]])
                          }
                          onBlur={(e) => {
                            handleDateRangeChange([
                              e.target.value,
                              dateRange[1],
                            ]);
                          }}
                          style={{ width: "100%" }}
                        />
                      </Grid>
                      <Grid item lg={2} md={6} sm={6} xs={6}>
                        <DatePicker
                          size="small"
                          value={dateRange[1]}
                          variant="outlined"
                          onChange={(e) =>
                            setDateRange([dateRange[0], e.target.value])
                          }
                          onBlur={(e) =>
                            handleDateRangeChange([
                              dateRange[0],
                              e.target.value,
                            ])
                          }
                          style={{ width: "100%" }}
                        />
                      </Grid>

                      <Grid item lg={6} md={6} sm={6} xs={6}>
                        <AutocompleteGroupInput
                          selectedItems={filterGroups.data}
                          onChange={(gg) => onGroupsChange(gg.map((g) => g.id))}
                        />
                      </Grid>
                      <Grid item lg={6} md={6} sm={6} xs={6}>
                        <AutocompleteGroupMemberInput
                          selectedItems={filterGroupsMembers.data}
                          onItemClick={(gms) =>
                            onGroupMembersChange(gms.map((gm) => gm.id))
                          }
                        />
                      </Grid>
                      <Grid item lg={6} md={6} sm={6} xs={6}>
                        <AutocompleteActorInput
                          selectedItems={filterActors.data}
                          onChange={(aa) => onActorsChange(aa.map((a) => a.id))}
                        />
                      </Grid>
                      <Grid item lg={6} md={6} sm={6} xs={6}>
                        <AutocompleteKeywordInput
                          selectedItems={filterKeywords.data}
                          onItemClick={(kk) =>
                            onKeywordsChange(kk.map((k) => k.id))
                          }
                        />
                      </Grid>

                      <Grid
                        item
                        md={12}
                        sm={6}
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
                  </EventsToolbar>
                </Grid>

                <Grid
                  item
                  lg={12}
                  md={12}
                  sm={12}
                  xs={12}
                  style={{ maxWidth: "100%" }}
                >
                  <EventsPanel
                    view={{
                      view: "events",
                    }}
                    tab={tab}
                    hash={hash}
                    filters={filters}
                    onActorClick={(a) => {
                      onActorsChange(filters.actors.concat(a.id));
                    }}
                    onGroupClick={(g) => {
                      onGroupsChange(filters.groups.concat(g.id));
                    }}
                    onGroupMemberClick={(gm) => {
                      onGroupMembersChange(filters.groupsMembers.concat(gm.id));
                    }}
                    onKeywordClick={(k) => {
                      onKeywordsChange(filters.keywords.concat(k.id));
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          );
        }
      )}
    />
  );
};

export default EventsPage;
