import * as React from "react";
import { Box } from "../../mui";
import ReferenceActorInput from '../common/ReferenceActorInput';
import ReferenceAreaInput from "../common/ReferenceAreaInput";

export const DeathEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <ReferenceActorInput source="payload.victim" />
      <ReferenceAreaInput source="payload.location" />
    </Box>
  );
};