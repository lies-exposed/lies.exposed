import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import EventsBox from "@liexp/ui/components/containers/EventsBox";
import { Box, Grid } from "@liexp/ui/components/mui";
import { EventNetworkGraphBox } from "@liexp/ui/containers/graphs/EventNetworkGraphBox";
import {
  useActorsQuery,
  useGroupsQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { type RouteComponentProps } from "@reach/router";
import subYears from "date-fns/subYears";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const IndexPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <Grid
      container
      style={{ width: "100%", justifyContent: "center" }}
      spacing={2}
    >
      <Grid item lg={10} md={12} xs={12}>
        <SEO title="lies.exposed" urlPath="/" />
        <PageContent path="index" />
        <KeywordsDistributionGraph
          onClick={(k) => {
            navigateTo.keywords({ id: k.id });
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <QueriesRenderer
              queries={{
                actor: useActorsQuery(
                  {
                    sort: { field: "updatedAt", order: "DESC" },
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  },
                  false
                ),
              }}
              render={({ actor: { data: actors } }) => {
                return (
                  <Box style={{ height: 600 }}>
                    <EventNetworkGraphBox
                      id={actors[0].id}
                      query={{
                        startDate: subYears(new Date(), 2).toISOString(),
                        groupBy: KEYWORDS.value,
                      }}
                      type={ACTORS.value}
                      showFilter={false}
                    />
                  </Box>
                );
              }}
            />
          </Grid>
          <Grid item md={6}>
            <QueriesRenderer
              queries={{
                groups: useGroupsQuery(
                  {
                    sort: { field: "updatedAt", order: "DESC" },
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  },
                  false
                ),
              }}
              render={({ groups: { data: groups } }) => {
                return (
                  <Box style={{ height: 600 }}>
                    <EventNetworkGraphBox
                      id={groups[0].id}
                      query={{
                        startDate: subYears(new Date(), 2).toISOString(),
                        groupBy: KEYWORDS.value,
                      }}
                      type={GROUPS.value}
                      showFilter={false}
                    />
                  </Box>
                );
              }}
            />
          </Grid>
        </Grid>
        <EventsBox
          title="Last updated events"
          query={{
            _sort: "updatedAt",
            _order: "DESC",
            _start: 0,
            _end: 6,
          }}
          onEventClick={(e) => {
            navigateTo.events({ id: e.id });
          }}
        />
      </Grid>
    </Grid>
  );
};

export default IndexPage;
