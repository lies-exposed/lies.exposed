import * as React from "react";
import {
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  DateTimeInput,
  Edit,
  EditProps,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceField,
  ReferenceInput,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import MarkdownInput from "./MarkdownInput";

export const GroupMemberList: React.FC<ListProps> = (props) => (
  <List {...props} resource="groups-members">
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <ReferenceField source="group" reference="groups">
        <TextField source="name" />
      </ReferenceField>
      <ReferenceField source="actor" reference="actors">
        <TextField source="fullName" />
      </ReferenceField>
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
