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

export const ActorList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField source="fullName" />
      <DateField source="updatedAt" showTime={true} />
      <TextField source="color" />
      <DateField source="date" />
      <TextField source="username" />
      <DateField source="createdAt" />
      <ImageField source="avatar" fullWidth={false} />
    </Datagrid>
  </List>
)

const EditTitle = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>
}

export const ActorEdit = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <SimpleForm>
      <TextInput source="id" />
      <DateInput source="updatedAt" />
      <TextInput source="color" />
      <DateInput source="date" />
      <TextInput source="username" />
      <TextInput source="fullName" />
      <TextInput source="type" />
      <DateInput source="createdAt" />
      <ImageField source="avatar" fullWidth={false} />
      <ImageInput source="avatar" />
      <TextInput source="body" />
    </SimpleForm>
  </Edit>
)

export const ActorCreate = (props: CreateProps) => (
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
