import * as React from "react";
import { ReferenceArrayField } from "react-admin";
import { Box } from "../../mui";
import { ActorDataGrid } from "../actors/ActorDataGrid";
import { EventDataGrid } from "../events/EventListPage";
import { GroupDataGrid } from "../groups/GroupDataGrid";
import { LinkDataGrid } from '../links/LinkDataGrid';
import { MediaDataGrid } from '../media';

export const StoryRelationsBox: React.FC = () => {
  return (
    <Box>
      <ReferenceArrayField reference="actors" source="actors">
        <ActorDataGrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="groups" source="groups">
        <GroupDataGrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="links" source="links">
        <LinkDataGrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="media" source="media">
        <MediaDataGrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="events" source="events">
        <EventDataGrid />
      </ReferenceArrayField>
    </Box>
  );
};
