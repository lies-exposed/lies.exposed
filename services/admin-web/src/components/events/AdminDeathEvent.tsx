import * as React from "react";
import { EditProps, FormTab, Record } from "react-admin";
import ReferenceActorInput from "components/Common/ReferenceActorInput";
import { Death } from "@econnessione/shared/io/http/Events";


export const DeathEventTitle: React.FC<{ record: Death.Death }> = ({ record }) => {
  return <span>Event: {record.payload.victim} on {record.date.toISOString()}</span>;
};

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
