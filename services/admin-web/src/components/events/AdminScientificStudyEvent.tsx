import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import {
  Datagrid,
  FormTab,
  ReferenceArrayField,
  TextInput,
  TextField
} from "ra-ui-materialui";

import { AvatarField } from "../Common/AvatarField";
import ReferenceGroupInput from "components/Common/ReferenceGroupInput";

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
