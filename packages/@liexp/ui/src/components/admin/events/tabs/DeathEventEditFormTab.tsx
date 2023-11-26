import * as React from "react";
import { Box } from "../../../mui";
import ReferenceActorInput from "../../actors/ReferenceActorInput";
import ReferenceAreaInput from "../../areas/input/ReferenceAreaInput";

export const DeathEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <ReferenceActorInput source="payload.victim" />
      <ReferenceAreaInput source="payload.location" />
    </Box>
  );
};
