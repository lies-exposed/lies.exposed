import * as React from "react";
import { type EditProps, TextInput, TextField } from "react-admin";
import { Box } from "../../mui";
import ReferenceActorInput from "../actors/ReferenceActorInput";

export const QuoteEditFormTab: React.FC<EditProps & { record?: any }> = (
  props,
) => (
  <Box>
    <ReferenceActorInput source="payload.actor" />
    <TextInput source="payload.details" fullWidth />
    <TextField source="payload.quote" fullWidth />
  </Box>
);
