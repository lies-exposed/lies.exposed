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
  required,
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
  return <span>Actor {record.fullName}</span>;
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
      <FormTab label="Images">
        <ArrayInput source="images">
          <SimpleFormIterator>
            <ImageField source="src" fullWidth={false} />
            <TextInput source="description" />
            <ImageInput source="avatar">
              <ImageField src="location" />
            </ImageInput>
          </SimpleFormIterator>
        </ArrayInput>
      </FormTab>
      <FormTab label="Links">
        <ArrayInput source="links" defaultValue={[]}>
          <SimpleFormIterator>
            <TextInput
              type="url"
              source="url"
              fullWidth={false}
              validate={[]}
            />
            <TextInput source="description" />
          </SimpleFormIterator>
        </ArrayInput>
        <ArrayField source="links">
          <Datagrid>
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
