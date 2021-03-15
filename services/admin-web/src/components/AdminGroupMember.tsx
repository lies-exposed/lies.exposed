import * as React from "react";
import {
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  List,
  ListProps,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TextField,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import MarkdownInput from "./Common/MarkdownInput";

export const GroupMemberList: React.FC<ListProps> = (props) => (
  <List {...props} resource="groups-members">
    <Datagrid rowClick="edit">
      <AvatarField source="group.avatar" />
      <AvatarField source="actor.avatar" />
      <DateField label="Started At" source="startDate" />
      <DateField label="Ended At" source="endDate" emptyText="Still going" />
      <TextField source="body" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>;
};

export const GroupMemberEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <SimpleForm>
      <ReferenceInput reference="actors" source="actor.id">
        <SelectInput optionText="fullName" />
      </ReferenceInput>
      <ReferenceInput reference="groups" source="group.id">
        <AutocompleteInput source="id" />
      </ReferenceInput>
      <DateInput source="startDate" />
      <DateInput source="endDate" />
      <MarkdownInput source="body" />
    </SimpleForm>
  </Edit>
);

export const GroupMemberCreate: React.FC<CreateProps> = (props) => (
  <Create {...props} title="Create a Group Member">
    <SimpleForm>
      <ReferenceInput reference="actors" source="actor">
        <SelectInput optionText="fullName" />
      </ReferenceInput>
      <ReferenceInput reference="groups" source="group">
        <AutocompleteInput source="id" />
      </ReferenceInput>
      <DateInput source="startDate" />
      <DateInput source="endDate" />
      <MarkdownInput source="body" />
    </SimpleForm>
  </Create>
);
