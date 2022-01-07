import * as React from "react";
import { EditProps, FormTab, Record } from "react-admin";
import ReferenceActorInput from "components/Common/ReferenceActorInput";

// const RESOURCE = "events";

export const transformDeathEvent = (id: string, data: Record): Record => {
  // eslint-disable-next-line no-console
  console.log("trasform death event", data);

  return {
    ...data,
    id,
    payload: {
      ...data.payload,
      victim: data.payload.victim,
    },
  };
};

export const DeathEventEditFormTab: React.FC<EditProps> = (
  props: EditProps
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);
