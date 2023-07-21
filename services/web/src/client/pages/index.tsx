import KeywordsDistributionGraph from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph";
import { PageContent } from "@liexp/ui/lib/components/PageContent";
import SEO from "@liexp/ui/lib/components/SEO";
import { type ActorItem } from "@liexp/ui/lib/components/lists/ActorList";
import { Box, Grid, Typography } from "@liexp/ui/lib/components/mui";
import ActorsBox from "@liexp/ui/lib/containers/ActorsBox";
import EventsBox from "@liexp/ui/lib/containers/EventsBox";
import { GroupsBox } from "@liexp/ui/lib/containers/GroupsBox";
import { MediaBox } from "@liexp/ui/lib/containers/MediaBox";
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

        <Box style={{ marginBottom: 50 }} />

        <Grid container style={{ marginTop: 38, marginBottom: 38 }}>
          <Grid item md={6}>
            <ActorsBox
              discrete={false}
              prefix="last-20-updated-actors"
              style={{ width: "100%", display: "flex" }}
              params={{
                filter: undefined,
                sort: { field: "updatedAt", order: "DESC" },
              }}
              onActorClick={(a: ActorItem) => {
                navigateTo.actors({ id: a.id }, { tab: 0 });
              }}
            />
          </Grid>
          <Grid item md={6}>
            <GroupsBox
              discrete={false}
              prefix="last-20-updated-actors"
              style={{ width: "100%", display: "flex" }}
              params={{
                sort: { field: "updatedAt", order: "DESC" },
              }}
              onItemClick={(g) => {
                navigateTo.groups({ id: g.id }, { tab: 0 });
              }}
            />
          </Grid>
        </Grid>

        <Grid container>
          <Grid item xs={12}>
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
          </Grid>
        </Grid>

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
