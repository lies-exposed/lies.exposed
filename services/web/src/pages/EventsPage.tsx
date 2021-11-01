import { Actor, Group, Keyword } from "@econnessione/shared/io/http";
import DatePicker from "@econnessione/ui/components/Common/DatePicker";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import {
  a11yProps,
  TabPanel,
} from "@econnessione/ui/components/Common/TabPanel";
import { ContentWithSidebar } from "@econnessione/ui/components/ContentWithSidebar";
import { EventsMap } from "@econnessione/ui/components/EventsMap";
import { EventsNetworkGraph } from "@econnessione/ui/components/Graph/EventsNetworkGraph";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@econnessione/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteKeywordInput } from "@econnessione/ui/components/Input/AutocompleteKeywordInput";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import { pageContentByPath } from "@econnessione/ui/providers/DataProvider";
import { Grid, Tab, Tabs, Button } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { formatISO, subYears } from "date-fns";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as S from "fp-ts/lib/string";
import * as React from "react";
import * as Helmet from "react-helmet";
import { resetInfiniteList } from "../state/commands";
import { doUpdateCurrentView, EventsView } from "../utils/location.utils";
import { EventsNetwork } from "@containers/EventsNetwork";
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
  return (
    <WithQueries
      queries={{
        page: pageContentByPath,
      }}
      params={{
        page: {
          path: "events",
        },
      }}
      render={(r) =>
        pipe(
          r,
          QR.fold(LazyFullSizeLoader, ErrorBox, ({ page }) => {
            const [dateRange, setDateRange] = React.useState<[string, string]>([
              startDate,
              endDate,
            ]);

            const handleUpdateCurrentview = React.useCallback(
              (filters: Partial<Omit<EventsView, "view">>): void => {
                const query = {
                  actors: actorIds,
                  groups: groupIds,
                  groupsMembers: groupsMembersIds,
                  keywords: keywordIds,
                  startDate: dateRange[0],
                  endDate: dateRange[1],
                  tab,
                  hash,
                };

                void resetInfiniteList(query as any, {
                  infiniteEventList: query as any,
                })().then(() =>
                  doUpdateCurrentView({
                    view: "events",
                    ...query,
                    ...filters,
                  })()
                );
              },
              [hash, tab]
            );

            const handleDateRangeChange = (range: [string, string]): void => {
              handleUpdateCurrentview({
                startDate: range[0],
                endDate: range[1],
              });
            };

            const onActorClick = (actor: Actor.Actor): void => {
              const newSelectedActorIds = A.elem(S.Eq)(actor.id, actorIds)
                ? A.array.filter(actorIds, (a) => !S.Eq.equals(a, actor.id))
                : actorIds.concat(actor.id);

              handleUpdateCurrentview({
                actors: newSelectedActorIds,
              });
            };

            const onGroupClick = (g: Group.Group): void => {
              const newSelectedGroupIds = A.elem(S.Eq)(g.id, groupIds)
                ? A.array.filter(groupIds, (_) => !S.Eq.equals(_, g.id))
                : groupIds.concat(g.id);

              handleUpdateCurrentview({
                groups: newSelectedGroupIds,
              });
            };

            const onKeywordClick = (keyword: Keyword.Keyword): void => {
              const newSelectedKeywords = A.elem(S.Eq)(keyword.id, keywordIds)
                ? A.array.filter(keywordIds, (_) => !S.Eq.equals(_, keyword.id))
                : keywordIds.concat(keyword.id);

              handleUpdateCurrentview({
                keywords: newSelectedKeywords,
              });
            };

            return (
              <ContentWithSidebar
                defaultOpen={true}
                sidebar={
                  <Grid container direction="column">
                    <Grid item style={{ margin: 10 }}>
                      <Grid container>
                        <Grid item md={6}>
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
                        <Grid item md={6}>
                          <DatePicker
                            size="small"
                            value={endDate}
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
                      </Grid>
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <AutocompleteKeywordInput
                        selectedIds={keywordIds}
                        onItemClick={onKeywordClick}
                      />
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <AutocompleteGroupInput
                        selectedIds={groupIds}
                        onItemClick={onGroupClick}
                      />
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <AutocompleteActorInput
                        selectedIds={actorIds}
                        onItemClick={onActorClick}
                      />
                    </Grid>
                    <Grid item style={{ margin: 10 }}>
                      <Button
                        onClick={() =>
                          handleUpdateCurrentview({
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
                }
              >
                <MainContent>
                  <Helmet.Helmet>
                    <SEO title={page.title} />
                  </Helmet.Helmet>
                  <Grid item>
                    <Grid container>
                      <Grid item md={12}>
                        <PageContent {...page} />
                      </Grid>

                      <Grid item md={12}>
                        <Tabs
                          value={tab}
                          onChange={(e, tab) =>
                            handleUpdateCurrentview({ tab })
                          }
                        >
                          <Tab label="network" {...a11yProps(0)} />
                          <Tab label="map" {...a11yProps(1)} />
                          <Tab label="list" {...a11yProps(2)} />
                        </Tabs>

                        <TabPanel value={tab} index={0}>
                          <EventsNetwork
                            filter={{
                              startDate,
                              endDate,
                              keywords: keywordIds,
                              groups: groupIds,
                              actors: actorIds,
                              groupsMembers: groupsMembersIds,
                              hash,
                            }}
                            groupBy={"actor"}
                            scale={"all"}
                            scalePoint={O.none}
                            onEventClick={(e) => {
                              void doUpdateCurrentView({
                                view: "event",
                                eventId: e.id,
                              })();
                            }}
                          />
                        </TabPanel>
                        <TabPanel value={tab} index={1}>
                          <EventsMap
                            filter={{
                              actors: [],
                              groups: [],
                            }}
                            onMapClick={() => {}}
                          />
                        </TabPanel>
                        <TabPanel value={tab} index={2}>
                          <InfiniteEventList
                            eventFilters={{
                              startDate,
                              endDate,
                              keywords: keywordIds,
                              groups: groupIds,
                              actors: actorIds,
                              groupsMembers: groupsMembersIds,
                              hash,
                            }}
                            deathFilters={{
                              minDate: startDate,
                              maxDate: endDate,
                              victim: actorIds,
                            }}
                            actors={[]}
                            groups={[]}
                            keywords={[]}
                            onClick={(e) => {
                              void doUpdateCurrentView({
                                view: "event",
                                eventId: e.id,
                              })();
                            }}
                          />
                        </TabPanel>
                      </Grid>
                    </Grid>
                  </Grid>
                </MainContent>
              </ContentWithSidebar>
            );
          })
        )
      }
    />
  );
};

export default EventsPage;
