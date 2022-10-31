import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead
} from "@liexp/shared/io/http/User";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import { MediaField } from "@liexp/ui/components/admin/common/MediaField";
import * as React from "react";
import {
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  FormTab,
  List,
  ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";

export const UserList: React.FC<ListProps> = (props) => (
  <List {...props} resource="users">
    <Datagrid rowClick="edit">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="username" />
      <TextField source="email" />
      <TextField source="permissions" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>user {record?.fullName}</span>;
};

export const UserEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle />} {...props}>
    <TabbedForm>
      <FormTab label="generals">
        <AvatarField source="avatar" />
        <MediaField source="avatar" type="image/jpeg" />
        <TextInput source="username" />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </FormTab>

      <FormTab label="Body">
        <TextField source="body" />
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
      <AutocompleteArrayInput
        source="permissions"
        choices={[
          AdminDelete.value,
          AdminEdit.value,
          AdminCreate.value,
          AdminRead.value,
          EventSuggestionEdit.value,
          EventSuggestionCreate.value,
          EventSuggestionRead.value,
        ].map((v) => ({ name: v, id: v }))}
      />
      <TextInput type="password" source="password" />
    </SimpleForm>
  </Create>
);
