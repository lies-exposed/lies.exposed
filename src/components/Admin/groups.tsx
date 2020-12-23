import * as React from "react"
import {
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
  TextField,
  TextInput,
} from "react-admin"
import MarkdownInput from "./MarkdownInput"

export const GroupList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="name" />
      <DateField source="updatedAt" />
      <TextField source="color" />
      <DateField source="date" />
      <DateField source="createdAt" />
      <ImageField source="avatar" fullWidth={false} />
    </Datagrid>
  </List>
)

const EditTitle = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>
}

export const GroupEdit = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="color" />
      <DateInput source="date" />
      <TextField source="type" />
      <ImageField source="avatar" fullWidth={false} />
      <ImageInput source="avatar" />
      <MarkdownInput source="body" />
      <DateField source="updatedAt" showTime={true} />
      <DateField source="createdAt" showTime={true} />
    </SimpleForm>
  </Edit>
)

export const GroupCreate = (props: CreateProps) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <DateInput source="updatedAt" />
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
