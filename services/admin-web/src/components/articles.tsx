import * as React from "react";
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  DateTimeInput,
  Edit,
  EditProps,
  ImageField,
  ImageInput,
  List,
  ListProps,
  required,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
} from "react-admin";
import MarkdownInput from "./MarkdownInput";

export const ArticleList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="title" />
      <TextField source="slug" />
      <ImageField source="featuredImage" />
      <DateField source="date" showTime={true} />
      <DateField source="createdAt" showTime={true} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

export const ArticleEdit: React.FC<EditProps> = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <BooleanInput source="draft" />
      <TextInput source="title" fullWidth={true} />
      <TextInput source="slug" fullWidth={true} />
      <ImageInput source="featuredImage" />
      <DateInput source="date" />
      <ArrayInput source="links">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>
      <MarkdownInput source="body" />
    </SimpleForm>
  </Edit>
);

export const ArticleCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create an Article" {...props}>
    <SimpleForm>
      <BooleanInput source="draft" />
      <TextInput source="title" fullWidth={true} />
      <TextInput source="path" fullWidth={true} />
      <ImageInput source="featuredImage" />
      <DateTimeInput source="date" />
      <ArrayInput source="links">
        <SimpleFormIterator>
          <TextInput source="" />
        </SimpleFormIterator>
      </ArrayInput>
      <MarkdownInput source="body" validate={[required()]} />
    </SimpleForm>
  </Create>
);
