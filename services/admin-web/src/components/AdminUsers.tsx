import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import RichTextInput from "./Common/RichTextInput";

export const UserList: React.FC<ListProps> = (props) => (
  <List {...props} resource="users">
    <Datagrid rowClick="edit">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="username" />
      <TextField source="email" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = ({ record }: any) => {
  return <span>user {record.fullName}</span>;
};

export const UserEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="generals">
        <ImageField source="avatar" />
        <TextInput source="username" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </FormTab>
      <FormTab label="Avatar">
        <ImageInput source="avatar">
          <ImageField />
        </ImageInput>
      </FormTab>

      <FormTab label="Body">
        <RichTextInput source="body" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const UserCreate: React.FC<CreateProps> = (props) => (
  <Create {...props} title="Create an user">
    <SimpleForm>
      <TextInput source="firstName" />
      <TextInput source="lastName" />
      <TextInput source="username" />
      <TextInput source="email" />
      <TextInput type="password" source="password" />
    </SimpleForm>
  </Create>
);
