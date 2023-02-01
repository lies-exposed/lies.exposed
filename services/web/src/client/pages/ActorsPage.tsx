import { ACTORS } from "@liexp/shared/io/http/Actor";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { ActorEventNetworkGraphBox } from "@liexp/ui/containers/graphs/ActorEventNetworkGraphBox";
import { useActorsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Grid } from "@mui/material";
import { type RouteComponentProps } from "@reach/router";
import { subYears } from "date-fns";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

export const queryParams = {
  pagination: { page: 1, perPage: 40 },
  sort: { field: "id", order: "ASC" },
  filter: {},
};

const ActorsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  // const pageContentByPath = usePageContentByPathQuery({ path: "actors" });

  return (
    <>
      <QueriesRenderer
        queries={{
          actors: useActorsQuery(queryParams, false),
        }}
        render={({ actors: { data: actors } }) => {
          return (
            <MainContent>
              <PageContent path="actors" />

              <>
                <AutocompleteActorInput
                  selectedItems={[]}
                  onChange={(c) => {
                    navigateTo.actors({
                      id: c[0].id,
                    });
                  }}
                />

                <ActorList
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                  actors={actors.map((a) => ({
                    ...a,
                    selected: true,
                  }))}
                  onActorClick={(a) => {
                    navigateTo.actors({ id: a.id });
                  }}
                />
              </>
              <Grid container>
                <Grid item md={6}>
                  <ActorEventNetworkGraphBox
                    params={{
                      sort: { field: "updatedAt", order: "DESC" },
                      pagination: {
                        perPage: 1,
                        page: 1,
                      },
                    }}
                    type={ACTORS.value}
                    query={{
                      groupBy: ACTORS.value,
                      startDate: subYears(new Date(), 2).toISOString(),
                    }}
                    showFilter={false}
                    onEventClick={(e) => {
                      navigateTo.events({ id: e.id });
                    }}
                    onActorClick={(e) => {
                      navigateTo.actors({ id: e.id });
                    }}
                    onGroupClick={(e) => {
                      navigateTo.groups({ id: e.id });
                    }}
                    onKeywordClick={(e) => {
                      navigateTo.keywords({ id: e.id });
                    }}
                  />
                </Grid>
                <Grid item md={6}>
                  <ActorEventNetworkGraphBox
                    params={{
                      pagination: {
                        perPage: 1,
                        page: 1,
                      },
                    }}
                    type={ACTORS.value}
                    query={{
                      groupBy: ACTORS.value,
                      startDate: subYears(new Date(), 2).toISOString(),
                    }}
                    showFilter={false}
                    onEventClick={(e) => {
                      navigateTo.events({ id: e.id });
                    }}
                    onActorClick={(e) => {
                      navigateTo.actors({ id: e.id });
                    }}
                    onGroupClick={(e) => {
                      navigateTo.groups({ id: e.id });
                    }}
                    onKeywordClick={(e) => {
                      navigateTo.keywords({ id: e.id });
                    }}
                  />
                </Grid>
              </Grid>
            </MainContent>
          );
        }}
      />
    </>
  );
};

export default ActorsPage;
