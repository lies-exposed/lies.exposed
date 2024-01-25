import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
} from "@liexp/shared/lib/io/http/User.js";
import {
  AutocompleteArrayInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  List,
  type ListProps,
  SimpleForm,
  TextField,
  TextInput,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

export const UserList: React.FC<ListProps> = (props) => (
  <List {...props} resource="users">
    <Datagrid rowClick="edit">
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="username" />
      <TextField source="email" />
      <TextField source="status" />
      <TextField source="permissions" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
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
