import * as React from "react";
import { EditProps, TextInput } from "react-admin";
import { Box } from "../../mui";
import ReferenceActorInput from "../common/ReferenceActorInput";

export const QuoteEditFormTab: React.FC<EditProps & { record?: any }> = (
  props
) => (
  <Box>
    <ReferenceActorInput source="payload.actor" />
    <TextInput source="payload.details" />
  </Box>
);
