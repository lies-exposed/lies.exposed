import { ACTORS } from "@liexp/shared/lib/io/http/Actor";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import { PageContent } from "@liexp/ui/lib/components/PageContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { ActorList } from "@liexp/ui/lib/components/lists/ActorList";
import { Grid } from "@liexp/ui/lib/components/mui";
import { ActorEventNetworkGraphBox } from "@liexp/ui/lib/containers/graphs/ActorEventNetworkGraphBox";
import {
  defaultGetActorsQueryParams,
  useActorsQuery,
} from "@liexp/ui/lib/state/queries/actor.queries";
import { type RouteComponentProps } from "@reach/router";
import { subYears } from "date-fns";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const ActorsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  return (
    <QueriesRenderer
      queries={{
        actors: useActorsQuery(defaultGetActorsQueryParams, false),
      }}
      render={({ actors: { data: actors } }) => {
        return (
          <MainContent style={{ height: "100%" }}>
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
            <Grid container style={{ height: 600 }}>
              <Grid item md={6} style={{ height: "100%" }}>
                <ActorEventNetworkGraphBox
                  params={{
                    sort: { field: "updatedAt", order: "DESC" },
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  }}
                  showRelations={false}
                  type={ACTORS.value}
                  relations={[ACTORS.value]}
                  query={{
                    startDate: formatDate(subYears(new Date(), 2)),
                    endDate: formatDate(new Date()),
                  }}
                  onEventClick={(e) => {
                    navigateTo.events({ id: e.id }, { tab: 0 });
                  }}
                  onActorClick={(e) => {
                    navigateTo.actors({ id: e.id }, { tab: 0 });
                  }}
                  onGroupClick={(e) => {
                    navigateTo.groups({ id: e.id }, { tab: 0 });
                  }}
                  onKeywordClick={(e) => {
                    navigateTo.keywords({ id: e.id }, { tab: 0 });
                  }}
                />
              </Grid>
              <Grid item md={6} style={{ height: "100%" }}>
                <ActorEventNetworkGraphBox
                  showRelations={false}
                  params={{
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  }}
                  type={ACTORS.value}
                  relations={[ACTORS.value]}
                  query={{
                    startDate: formatDate(subYears(new Date(), 2)),
                    endDate: formatDate(new Date()),
                  }}
                  onEventClick={(e) => {
                    navigateTo.events({ id: e.id }, { tab: 0 });
                  }}
                  onActorClick={(e) => {
                    navigateTo.actors({ id: e.id }, { tab: 0 });
                  }}
                  onGroupClick={(e) => {
                    navigateTo.groups({ id: e.id }, { tab: 0 });
                  }}
                  onKeywordClick={(e) => {
                    navigateTo.keywords({ id: e.id }, { tab: 0 });
                  }}
                />
              </Grid>
            </Grid>
          </MainContent>
        );
      }}
    />
  );
};

export default ActorsPage;
