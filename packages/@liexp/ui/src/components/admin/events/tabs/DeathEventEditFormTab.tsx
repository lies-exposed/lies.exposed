import * as React from "react";
import { Stack } from "../../../mui/index.js";
import ReferenceActorInput from "../../actors/ReferenceActorInput.js";
import ReferenceAreaInput from "../../areas/input/ReferenceAreaInput.js";

export const DeathEventEditFormTab: React.FC = () => {
  return (
    <Stack direction="column">
      <ReferenceActorInput source="payload.victim" />
      <ReferenceAreaInput source="payload.location" />
    </Stack>
  );
};
