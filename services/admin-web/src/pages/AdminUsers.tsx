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
          AdminDelete.literals[0],
          AdminEdit.literals[0],
          AdminCreate.literals[0],
          AdminRead.literals[0],
          EventSuggestionEdit.literals[0],
          EventSuggestionCreate.literals[0],
          EventSuggestionRead.literals[0],
        ].map((v) => ({ name: v, id: v }))}
      />
      <TextInput type="password" source="password" />
    </SimpleForm>
  </Create>
);
