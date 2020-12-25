import * as React from "react"
import {
  ArrayInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  ImageField,
  ImageInput,
  List,
  ListProps,
  SimpleForm,
  SimpleFormIterator,
  TextField,
  TextInput,
} from "react-admin"
import MarkdownInput from "./MarkdownInput"

export const ArticleList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="title" />
      <TextField source="path" />
      <ImageField source="featuredImage" />
      <DateField source="date" showTime={true} />
      <DateField source="createdAt" showTime={true} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
)


export const ArticleEdit: React.FC<EditProps> = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <BooleanInput source="draft" />
      <TextInput source="title" fullWidth={true} />
      <TextInput source="path" fullWidth={true} />
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
)

export const ArticleCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create an Article" {...props}>
    <SimpleForm>
      <TextInput source="color" />
      <DateInput source="date" />
      <TextInput source="username" />
      <TextInput source="fullName" />
      <TextInput source="type" />
      <DateInput source="createdAt" />
      <ImageInput source="avatar" />
      <TextInput source="body" />
    </SimpleForm>
  </Create>
)
