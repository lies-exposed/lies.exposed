import * as React from "react";
import { TextInput, type EditProps, type RaRecord } from "react-admin";
import { Box } from "../../../mui/index.js";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput.js";
import ReferenceGroupInput from "../../groups/ReferenceGroupInput.js";
import ReferenceLinkInput from "../../links/ReferenceLinkInput.js";

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
