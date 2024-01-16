import * as React from "react";
import { TextInput } from "react-admin";
import { Box } from "../../../mui/index.js";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput.js";
import ReferenceArrayGroupInput from "../../groups/ReferenceArrayGroupInput.js";
import ReferenceLinkInput from "../../links/ReferenceLinkInput.js";

export const PatentEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <ReferenceLinkInput source="payload.source" />
      <ReferenceArrayActorInput
        source="payload.owners.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.owners.groups"
        defaultValue={[]}
      />
    </Box>
  );
};
