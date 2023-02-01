import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import EventsBox from "@liexp/ui/components/containers/EventsBox";
import { Grid } from "@liexp/ui/components/mui";
import { ActorEventNetworkGraphBox } from "@liexp/ui/containers/graphs/ActorEventNetworkGraphBox";
import { GroupEventNetworkGraphBox } from "@liexp/ui/containers/graphs/GroupEventNetworkGraphBox";
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
            <ActorEventNetworkGraphBox
              params={{
                sort: { field: "updatedAt", order: "DESC" },
                pagination: {
                  perPage: 1,
                  page: 2,
                },
              }}
              type={KEYWORDS.value}
              query={{
                groupBy: ACTORS.value,
                startDate: subYears(new Date(), 2).toISOString(),
                relation: GROUPS.value,
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
            <GroupEventNetworkGraphBox
              params={{
                sort: { field: "updatedAt", order: "DESC" },
                pagination: {
                  perPage: 1,
                  page: 2,
                },
              }}
              type={KEYWORDS.value}
              query={{
                groupBy: ACTORS.value,
                startDate: subYears(new Date(), 2).toISOString(),
                relation: GROUPS.value,
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
