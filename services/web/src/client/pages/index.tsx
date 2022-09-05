import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import EventsBox from "@liexp/ui/components/containers/EventsBox";
import { Grid } from "@liexp/ui/components/mui";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { queryToHash } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";

const IndexPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <Grid container style={{ width: "100%" }}>
      <Grid item lg={1} />
      <Grid item lg={10} md={12} xs={12}>
        <SEO title="lies.exposed" urlPath="/" />
        <PageContent path="index" />
        <KeywordsDistributionGraph
          onClick={(k) => {
            navigateTo.events({}, { hash: queryToHash({ keywords: [k.id] }) });
          }}
        />
        <EventsBox
          title="Last updated events"
          query={{
            _sort: "updatedAt",
            _order: "DESC",
            _start: 0,
            _end: 6,
          }}
          onEventClick={(e) => navigateTo.events({ id: e.id })}
        />
      </Grid>
    </Grid>
  );
};

export default IndexPage;
