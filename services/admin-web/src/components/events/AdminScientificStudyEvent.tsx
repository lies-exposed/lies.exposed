import {
  Datagrid,
  FormTab,
  ReferenceArrayField,
  TextInput,
  TextField,
} from "ra-ui-materialui";
import * as React from "react";
import { AvatarField } from "../Common/AvatarField";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceGroupInput from "../Common/ReferenceGroupInput";
import { ScientificStudy } from "@econnessione/shared/io/http/Events";

export const ScientificStudyEventTitle: React.FC<{
  record: ScientificStudy.ScientificStudy;
}> = ({ record }: any) => {
  return <span>Event: {record.payload.title}</span>;
};

export const EditScientificStudyEvent: React.FC = (props) => {
  return (
    <FormTab label="Payload" {...props}>
      <TextInput source="title" />
      <ReferenceGroupInput source="payload.publisher" />
      <ReferenceArrayActorInput source="newAuthors" />
      <ReferenceArrayField source="payload.authors" reference="actors">
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="fullName" />
          <AvatarField source="avatar" />
        </Datagrid>
      </ReferenceArrayField>
    </FormTab>
  );
};
