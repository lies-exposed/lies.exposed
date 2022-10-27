import * as React from "react";
import {
    EditProps, TextInput
} from "react-admin";
import { Box } from "../../mui";
import ReferenceAreaInput from "../common/ReferenceAreaInput";
import ReferenceArrayActorInput from "../common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../common/ReferenceArrayGroupInput";
import ReferenceMediaInput from "../common/ReferenceMediaInput";

export const DocumentaryEditFormTab: React.FC<EditProps & { record?: any }> = (
    props
  ) => (
    <Box>
      <TextInput fullWidth source="payload.title" />
      <ReferenceAreaInput source="payload.location" />
      <TextInput type="url" fullWidth source="payload.website" />
      <ReferenceMediaInput
        allowedTypes={["video/mp4", "iframe/video"]}
        source="payload.media"
      />
  
      {/** Authors */}
      <ReferenceArrayActorInput
        source="payload.authors.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.authors.groups"
        defaultValue={[]}
      />
  
      {/** Subjects */}
      <ReferenceArrayActorInput
        source="payload.subjects.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.subjects.groups"
        defaultValue={[]}
      />
    </Box>
  );