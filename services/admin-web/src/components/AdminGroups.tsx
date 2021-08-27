import { GroupPageContent } from "@econnessione/shared/components/GroupPageContent";
import * as io from "@econnessione/shared/io";
import { renderValidationErrors } from "@econnessione/shared/utils/renderValidationErrors";
import { apiProvider } from "client/HTTPAPI";
import { uploadImages } from "client/MediaAPI";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import {
  ArrayField,
  ChoicesInputProps,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  SelectInput,
  SimpleForm,
  SingleFieldList,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
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
      <AvatarField source="avatar" fullWidth={false} />
      <TextField source="name" />
      <TextField source="color" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformGroup = (data: Record): Record | Promise<Record> => {
  if (data.avatar?.rawFile) {
    return pipe(
      uploadImages(apiProvider)("groups", data.name, [data.avatar.rawFile]),
      TE.map((locations) => ({ ...data, members: [], avatar: locations[0] }))
    )().then((result) => {
      if (E.isLeft(result)) {
        throw result.left;
      }
      return result.right;
    });
  }
  return { ...data, members: [] };
};

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
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              io.http.Group.Group.decode(formData),
              E.fold(renderValidationErrors, (p) => (
                <GroupPageContent
                  {...p}
                  groupMembers={[]}
                  events={[]}
                  projects={[]}
                  funds={[]}
                  onMemberClick={() => {}}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const GroupCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Group" {...props} transform={transformGroup}>
    <SimpleForm>
      <ColorInput source="color" />
      <DateInput source="date" />
      <TextInput source="name" />
      <GroupKindInput source="kind" />
      <ArrayField source="members">
        <SingleFieldList>
          <TextField source="" />
        </SingleFieldList>
      </ArrayField>
      <ImageInput source="avatar">
        <ImageField src="src" />
      </ImageInput>
      <MarkdownInput source="body" defaultValue="" />
    </SimpleForm>
  </Create>
);
