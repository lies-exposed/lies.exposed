import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  List,
  ListProps,
  required,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import MarkdownInput from "./MarkdownInput";

const RESOURCE = "projects";

export const ProjectList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <DateField source="startDate" />
      <DateField source="endDate" emptyText="-" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Project {record.title}</span>;
};

export const ProjectEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="name" />
        <TextInput source="color" />
        <DateInput source="date" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <MarkdownInput source="body" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ProjectCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="name" validate={[required()]} />
      <ColorInput source="color" validate={[required()]} />
      <DateInput source="startDate" validate={[required()]} />
      <DateInput source="endDate" />
      <MarkdownInput source="body" defaultValue="" validate={[required()]} />
    </SimpleForm>
  </Create>
);
