import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
  AdminRead,
  EventSuggestionCreate,
  EventSuggestionEdit,
  EventSuggestionRead,
  UserStatus,
} from "@liexp/shared/lib/io/http/User.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField";
import {
  AutocompleteArrayInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  Edit,
  type EditProps,
  FormTab,
  List,
  type ListProps,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "@liexp/ui/lib/components/admin/react-admin";
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

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>user {record?.fullName}</span>;
};

export const UserEdit: React.FC<EditProps> = (props) => (
  <Edit title={<EditTitle />} {...props}>
    <TabbedForm>
      <FormTab label="generals">
        <AvatarField source="avatar" />
        <MediaField source="avatar" type="image/jpeg" controls={false} />
        <TextInput source="username" />
        <TextInput source="firstName" />
        <TextInput source="lastName" />
        <SelectInput
          source="status"
          choices={UserStatus.types.map((t) => ({
            id: t.value,
            name: t.value,
          }))}
        />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
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
