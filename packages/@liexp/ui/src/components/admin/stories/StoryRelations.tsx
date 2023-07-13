import * as React from "react";
import { ReferenceArrayField } from "react-admin";
import { Box } from "../../mui";
import { ActorDataGrid } from "../actors/ActorDataGrid";
import { GroupDataGrid } from "../groups/GroupDataGrid";
import { LinkDatagrid } from "../links/AdminLinks";

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
        <LinkDatagrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="events" source="events">
        <LinkDatagrid />
      </ReferenceArrayField>
    </Box>
  );
};
