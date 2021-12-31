import { dataProvider } from "@client/HTTPAPI";
import { RawMedia, uploadFile } from "@client/MediaAPI";
import { Media } from "@econnessione/shared/io/http";
import { uuid } from "@econnessione/shared/utils/uuid";
import ReactPageInput from "components/Common/ReactPageInput";
import ReferenceActorInput from "components/Common/ReferenceActorInput";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import * as React from "react";
import { EditProps, FormTab, Record } from "react-admin";

const RESOURCE = "events";

export const transformDeathEvent = (
  id: string,
  data: Record
): Record => {
  console.log('trasform death event', data);

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
