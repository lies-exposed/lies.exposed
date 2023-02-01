import * as React from "react";
import { TextInput } from "react-admin";
import { Box } from "../../mui";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput";
import URLMetadataInput from '../common/URLMetadataInput';
import ReferenceArrayGroupInput from '../groups/ReferenceArrayGroupInput';

export const PatentEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <URLMetadataInput type="Link" source="payload.source" />
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