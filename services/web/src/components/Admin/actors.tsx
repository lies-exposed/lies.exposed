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

export const ActorList: React.FC<ListProps> = (props) => (
  <List {...props}>
    <Datagrid rowClick="edit">
      <TextField label="Full Name" source="frontmatter.fullName" />
      <TextField source="frontmatter.username" />
      <TextField source="frontmatter.color" />
      <ImageField source="frontmatter.avatar" fullWidth={false} />
      <DateField
        label="Updated At"
        source="frontmatter.updatedAt"
        showTime={true}
      />
      <DateField
        label="Created At"
        source="frontmatter.createdAt"
        showTime={true}
      />
    </Datagrid>
  </List>
)

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>
}

export const ActorEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <SimpleForm>
      <ImageField label="Avatar" source="frontmatter.avatar" fullWidth={false} />
      <TextInput source="id" />
      <TextInput source="frontmatter.color" />
      <TextInput source="frontmatter.username" />
      <TextInput source="frontmatter.fullName" />
      <ImageInput source="frontmatter.avatar" />
      <TextInput source="body" />
      <DateField source="frontmatter.createdAt" />
      <DateField source="frontmatter.updatedAt" />
    </SimpleForm>
  </Edit>
)

export const ActorCreate: React.FC<CreateProps> = (props) => (
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
