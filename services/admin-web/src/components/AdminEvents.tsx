import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayInput,
  required,
  SelectArrayInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import MarkdownInput from "./MarkdownInput";

const RESOURCE = "events";

export const EventList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Events {record.fullName}</span>;
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="title" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <MarkdownInput source="body" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput source="actors" reference="actors">
          <SelectArrayInput optionText="fullName" />
        </ReferenceArrayInput>
        <ArrayField source="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="fullName" />
            <ImageField source="avatar" fullWidth={false} />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Groups">
      <ReferenceArrayInput source="groups" reference="groups">
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>
        <ArrayField source="groups">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <ImageField source="avatar" fullWidth={false} />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Images">
        <ArrayField source="images">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <ImageField source="location" fullWidth={false} />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Links">
        <ArrayField source="links">
          <Datagrid resource="links" rowClick="edit">
            <TextField source="id" />
            <TextField source="url" />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const EventCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Event" {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <DateInput
        source="startDate"
        validation={[required()]}
        defaultValue={new Date()}
      />
      <DateInput source="endDate" />
      <MarkdownInput source="body" defaultValue="" />
    </SimpleForm>
  </Create>
);
