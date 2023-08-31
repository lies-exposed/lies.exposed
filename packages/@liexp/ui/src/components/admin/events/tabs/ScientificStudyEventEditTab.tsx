import * as React from "react";
import { TextInput, type EditProps, type RaRecord } from "react-admin";
import { Box } from "../../../mui";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput";
import ReferenceGroupInput from "../../groups/ReferenceGroupInput";
import ReferenceLinkInput from "../../links/ReferenceLinkInput";

export const ScientificStudyEventEditTab: React.FC<
  EditProps & { record?: RaRecord }
> = (props) => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <ReferenceLinkInput source="payload.url" />
      <ReferenceGroupInput source="payload.publisher" />
      <ReferenceArrayActorInput source="payload.authors" />
    </Box>
  );
};
