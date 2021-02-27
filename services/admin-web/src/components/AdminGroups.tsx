import * as io from "@econnessione/shared/io";
import * as React from "react";
import {
  ChoicesInputProps,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceField,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import MarkdownInput from "./Common/MarkdownInput";

const RESOURCE = "groups";

const GroupKindInput: React.FC<ChoicesInputProps> = (props) => (
  <SelectInput
    {...props}
    choices={io.http.Group.GroupKind.types.map((t) => ({
      id: t.value,
      name: t.value,
    }))}
  />
);

export const GroupList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE}>
    <Datagrid rowClick="edit">
      <ImageField source="avatar" fullWidth={false} />
      <TextField source="name" />
      <TextField source="color" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>;
};

export const GroupEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit title={<EditTitle {...props} />} {...props}>
    <TabbedForm>
      <FormTab label="Generals">
        <TextInput source="name" />
        <TextInput source="color" />
        <DateInput source="date" />
        <GroupKindInput source="kind" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Avatar">
        <ImageField source="avatar" fullWidth={false} />
        <ImageInput source="avatar">
          <ImageField src="src" />
        </ImageInput>
      </FormTab>
      <FormTab label="Body">
        <MarkdownInput source="body" />
      </FormTab>
      <FormTab label="Members">
        <ReferenceArrayField source="members" reference="groups-members">
          <Datagrid>
            <TextField source="id" />
            <ReferenceField label="Actor" source="actorId" reference="actors">
              <TextField source="username" />
            </ReferenceField>
            <DateField source="createdAt" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const GroupCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Post" {...props}>
    <SimpleForm>
      <ColorInput source="color" />
      <DateInput source="date" />
      <TextInput source="name" />
      <GroupKindInput source="kind" />
      <ImageInput source="avatar">
        <ImageField src="src" />
      </ImageInput>
      <MarkdownInput source="body" defaultValue="" />
    </SimpleForm>
  </Create>
);
