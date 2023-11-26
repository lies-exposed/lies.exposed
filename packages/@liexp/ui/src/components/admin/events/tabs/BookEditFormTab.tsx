import { AudioType, PDFType } from "@liexp/shared/lib/io/http/Media";
import * as React from "react";
import { TextInput, type EditProps } from "react-admin";
import { Box } from "../../../mui";
import ReferenceArrayBySubjectInput from "../../common/inputs/BySubject/ReferenceArrayBySubjectInput";
import ReferenceBySubjectInput from "../../common/inputs/BySubject/ReferenceBySubjectInput";
import ReferenceMediaInput from "../../media/input/ReferenceMediaInput";

export const BookEditFormTab: React.FC<EditProps & { record?: any }> = (
  props,
) => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <ReferenceMediaInput
        source="payload.media.pdf"
        allowedTypes={[PDFType.value]}
      />
      <ReferenceMediaInput source="payload.media.audio" allowedTypes={AudioType.types.map(t => t.value)} />
      <ReferenceArrayBySubjectInput source="payload.authors" />
      <ReferenceBySubjectInput source="payload.publisher" />
    </Box>
  );
};
