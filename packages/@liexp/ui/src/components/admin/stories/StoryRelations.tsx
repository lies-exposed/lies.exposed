import * as React from "react";
import { ReferenceArrayField } from "react-admin";
import { Box, Grid } from "../../mui/index.js";
import { ActorDataGrid } from "../actors/ActorDataGrid.js";
import { EventDataGrid } from "../events/EventListPage.js";
import { GroupDataGrid } from "../groups/GroupDataGrid.js";
import { LinkDataGrid } from "../links/LinkDataGrid.js";
import { MediaDataGrid } from "../media/index.js";

export const StoryRelationsBox: React.FC = () => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ReferenceArrayField reference="actors" source="actors">
            <ActorDataGrid />
          </ReferenceArrayField>
          <ReferenceArrayField reference="groups" source="groups">
            <GroupDataGrid />
          </ReferenceArrayField>
          <ReferenceArrayField reference="links" source="links">
            <LinkDataGrid />
          </ReferenceArrayField>
        </Grid>
        <Grid item xs={12} md={6}>
          <ReferenceArrayField reference="media" source="media">
            <MediaDataGrid />
          </ReferenceArrayField>
          <ReferenceArrayField reference="events" source="events">
            <EventDataGrid />
          </ReferenceArrayField>
        </Grid>
      </Grid>
    </Box>
  );
};
