import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { BookCard } from "@liexp/ui/lib/components/Cards/Events/BookCard.js";
import KeywordsDistributionGraph from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { type ActorItem } from "@liexp/ui/lib/components/lists/ActorList.js";
import { Box, Grid2, Typography } from "@liexp/ui/lib/components/mui/index.js";
import ActorsBox from "@liexp/ui/lib/containers/ActorsBox.js";
import EventsBox from "@liexp/ui/lib/containers/EventsBox.js";
import { GroupsBox } from "@liexp/ui/lib/containers/GroupsBox.js";
import { MediaBox } from "@liexp/ui/lib/containers/MediaBox.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../utils/location.utils.js";

const IndexPage: React.FC<RouteComponentProps> = () => {
  const navigateTo = useNavigateToResource();

  return (
    <Grid2
      container
      style={{ width: "100%", justifyContent: "center" }}
      spacing={2}
    >
      <Grid2 size={{ lg: 10, md: 12, xs: 12 }}>
        <SEO title="lies.exposed" urlPath="/" />
        <PageContentBox path="index" />
        <KeywordsDistributionGraph
          count={40}
          onClick={(k) => {
            navigateTo.keywords({ id: k.id });
          }}
        />

        <Box style={{ marginBottom: 50 }} />

        <Grid2 container style={{ marginTop: 38, marginBottom: 38 }}>
          <Grid2 size={6}>
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
          </Grid2>
          <Grid2 size={6}>
            <GroupsBox
              discrete={false}
              prefix="last-20-updated-actors"
              style={{ width: "100%", display: "flex" }}
              params={{
                filter: {},
                sort: { field: "updatedAt", order: "DESC" },
              }}
              onItemClick={(g) => {
                navigateTo.groups({ id: g.id }, { tab: 0 });
              }}
            />
          </Grid2>
        </Grid2>

        <Grid2 container>
          <Grid2 size={12}>
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
                columns={{ md: 4 }}
              />
            </Box>
          </Grid2>
          <Grid2 size={12}>
            <Box style={{ marginBottom: 150 }}>
              <EventsBox
                title="Last books"
                query={{
                  _sort: "updatedAt",
                  _order: "DESC",
                  _start: 0,
                  _end: 6,
                  eventType: [BOOK.Type],
                }}
                onEventClick={(e) => {
                  navigateTo.events({ id: e.id });
                }}
                card={BookCard}
                columns={{ sm: 12, md: 4, lg: 2 }}
              />
            </Box>
          </Grid2>
          <Grid2 container style={{ marginBottom: 150, width: "100%" }}>
            <Grid2 size={12}>
              <Typography variant="h5">Last Created Media</Typography>
            </Grid2>
            <Grid2 size={12}>
              <MediaBox
                disableZoom
                filter={{ _sort: "createdAt", _order: "DESC" }}
                limit={20}
                style={{ height: 1200, width: "100%" }}
                onClick={(m) => {
                  navigateTo.media({ id: m.id });
                }}
              />
            </Grid2>
          </Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default IndexPage;
