import * as React from "react";
import { TextField, TextInput, type EditProps } from "react-admin";
import { Box } from "../../../mui/index.js";
import ReferenceBySubjectInput from "../../common/inputs/BySubject/ReferenceBySubjectInput.js";

export const QuoteEditFormTab: React.FC<EditProps & { record?: any }> = (
  props,
) => {
  return (
    <Box>
      <ReferenceBySubjectInput source="payload.subject" />
      <TextInput source="payload.details" fullWidth />
      <TextField source="payload.quote" fullWidth />
    </Box>
  );
};
