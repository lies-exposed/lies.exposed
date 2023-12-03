import { IframeVideoType, MP4Type } from "@liexp/shared/lib/io/http/Media";
import * as React from "react";
import { type EditProps, TextInput } from "react-admin";
import { Box } from "../../../mui";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput";
import ReferenceAreaInput from "../../areas/input/ReferenceAreaInput";
import ReferenceArrayGroupInput from "../../groups/ReferenceArrayGroupInput";
import ReferenceLinkInput from "../../links/ReferenceLinkInput";
import ReferenceMediaInput from "../../media/input/ReferenceMediaInput";

export const DocumentaryEditFormTab: React.FC<EditProps & { record?: any }> = (
  props,
) => (
  <Box>
    <TextInput fullWidth source="payload.title" />
    <ReferenceAreaInput source="payload.location" />
    <ReferenceLinkInput source="payload.website" fullWidth />
    <ReferenceMediaInput
      allowedTypes={[MP4Type.value, IframeVideoType.value]}
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
