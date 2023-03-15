import KeywordsDistributionGraph from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { PageContent } from "@liexp/ui/components/PageContent";
import SEO from "@liexp/ui/components/SEO";
import { Box, Grid, Typography } from "@liexp/ui/components/mui";
import EventsBox from "@liexp/ui/containers/EventsBox";
import { MediaBox } from "@liexp/ui/containers/MediaBox";
import { type RouteComponentProps } from "@reach/router";
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
        <Box style={{ marginBottom: 150 }}>
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
        </Box>

        <Grid container style={{ marginBottom: 150 }}>
          <Grid item xs={12}>
            <Typography variant="h5">Last Created Media</Typography>
          </Grid>
          <Grid item md={12}>
            <MediaBox
              hideDescription
              disableZoom
              filter={{ _sort: "createdAt", _order: "DESC" }}
              limit={20}
              onClick={(m) => {
                navigateTo.media({ id: m.id });
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default IndexPage;
