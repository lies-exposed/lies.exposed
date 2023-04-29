import * as React from "react";
import { ReferenceArrayField } from "react-admin";
import { Box } from "../../mui";
import { LinkDatagrid } from "../links/AdminLinks";

export const StoryRelationsBox: React.FC = () => {
  return (
    <Box>
      <ReferenceArrayField reference="links" source="links">
        <LinkDatagrid />
      </ReferenceArrayField>
      <ReferenceArrayField reference="events" source="events">
        <LinkDatagrid />
      </ReferenceArrayField>
    </Box>
  );
};
