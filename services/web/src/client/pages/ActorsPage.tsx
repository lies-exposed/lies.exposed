import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { defaultUseQueryListParams } from "@liexp/shared/lib/providers/EndpointQueriesProvider/params.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { ActorList } from "@liexp/ui/lib/components/lists/ActorList.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import { ActorEventNetworkGraphBox } from "@liexp/ui/lib/containers/graphs/ActorEventNetworkGraphBox.js";
import { type RouteComponentProps } from "@reach/router";
import { subYears } from "date-fns";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const ActorsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  return (
    <QueriesRenderer
      queries={(Q) => ({
        actors: Q.Actor.list.useQuery(defaultUseQueryListParams),
      })}
      render={({ actors: { data: actors } }) => {
        return (
          <MainContent style={{ height: "100%" }}>
            <PageContentBox path="actors" />

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
              <Grid item md={12} style={{ height: "100%" }}>
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
            </Grid>
          </MainContent>
        );
      }}
    />
  );
};

export default ActorsPage;
