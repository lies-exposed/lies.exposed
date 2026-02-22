import { BOOK } from "@liexp/io/lib/http/Events/EventType.js";
import { BookCard } from "@liexp/ui/lib/components/Cards/Events/BookCard.js";
import KeywordsDistributionGraph from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { type ActorItem } from "@liexp/ui/lib/components/lists/ActorList.js";
import { Box, Grid, Typography, useMuiMediaQuery } from "@liexp/ui/lib/components/mui/index.js";
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
  const isSM = useMuiMediaQuery("min-width: 600px");
  const isMD = useMuiMediaQuery("min-width: 960px");

  // Responsive values for MediaBox
  const mediaBoxColumns = isMD ? 2 : isSM ? 2 : 1;
  const mediaBoxHeight = isMD ? 1200 : isSM ? 900 : 600;

  return (
    <Grid
      container
      style={{ width: "100%", justifyContent: "center" }}
      spacing={2}
    >
      <Grid
        size={{ lg: 10, md: 12, xs: 12 }}
        sx={{ px: { xs: 2, sm: 3, md: 2 } }}
      >
        <SEO title="lies.exposed" urlPath="/" />
        <PageContentBox path="index" />
        <Box sx={{ height: { xs: 300, sm: 400, md: 500 }, width: "100%", marginBottom: 3 }}>
          <KeywordsDistributionGraph
            count={40}
            onClick={(k) => {
              navigateTo.keywords({ id: k.id });
            }}
          />
        </Box>

        <Box sx={{ marginBottom: { xs: 3, md: 6 } }} />

        <Grid
          container
          spacing={{ xs: 1, sm: 2, md: 3 }}
          sx={{
            marginTop: { xs: 2, sm: 3, md: 4 },
            marginBottom: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <ActorsBox
              discrete={false}
              prefix="last-20-updated-actors"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
              params={{
                _sort: "updatedAt",
                _order: "DESC",
              }}
              onActorClick={(a: ActorItem) => {
                navigateTo.actors({ id: a.id }, { tab: 0 });
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <GroupsBox
              discrete={false}
              prefix="last-20-updated-actors"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
              params={{
                _sort: "updatedAt",
                _order: "DESC",
              }}
              onItemClick={(g) => {
                navigateTo.groups({ id: g.id }, { tab: 0 });
              }}
            />
          </Grid>
        </Grid>

             <Grid container>
             <Grid size={12}>
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
                   columns={{ xs: 12, sm: 6, md: 4 }}
                 />
               </Box>
             </Grid>
             <Grid size={12}>
               <Box style={{ marginBottom: 150 }}>
                 <EventsBox
                   title="Last books"
                   query={{
                     _sort: "updatedAt",
                     _order: "DESC",
                     _start: 0,
                     _end: 6,
                     eventType: [BOOK.literals[0]],
                   }}
                   onEventClick={(e) => {
                     navigateTo.events({ id: e.id });
                   }}
                   card={BookCard}
                   columns={{ xs: 12, sm: 6, md: 4, lg: 2 }}
                 />
               </Box>
             </Grid>
             <Grid
               container
               style={{ marginBottom: 150, width: "100%", overflowX: "hidden" }}
             >
               <Grid size={12}>
                 <Typography variant="h5">Last Created Media</Typography>
               </Grid>
               <Grid size={12}>
                 <MediaBox
                   disableZoom
                   filter={{ _sort: "createdAt", _order: "DESC" }}
                   limit={20}
                   columns={mediaBoxColumns}
                   style={{ height: mediaBoxHeight, width: "100%", maxWidth: "100%" }}
                   onClick={(m) => {
                     navigateTo.media({ id: m.id });
                   }}
                 />
               </Grid>
             </Grid>
           </Grid>
      </Grid>
    </Grid>
  );
};

export default IndexPage;
