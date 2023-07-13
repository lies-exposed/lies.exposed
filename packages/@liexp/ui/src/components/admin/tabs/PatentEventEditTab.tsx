import * as React from "react";
import { TextInput } from "react-admin";
import { Box } from "../../mui";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../groups/ReferenceArrayGroupInput";
import ReferenceLinkInput from "../links/ReferenceLinkInput";

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
