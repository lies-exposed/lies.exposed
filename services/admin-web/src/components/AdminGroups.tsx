import * as io from "@econnessione/shared/io";
import { uuid } from "@econnessione/shared/utils/uuid";
import { GroupPageContent } from "@econnessione/ui/components/GroupPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import { Typography } from "@material-ui/core";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import RichTextInput from "ra-input-rich-text";
import * as React from "react";
import {
  AutocompleteArrayInput,
  ChoicesInputProps,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
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
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
import ReactPageInput from "./Common/ReactPageInput";
import ReferenceArrayGroupMemberInput from "./Common/ReferenceArrayGroupMemberInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import { apiProvider } from "@client/HTTPAPI";
import { uploadImages } from "@client/MediaAPI";

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

const GroupFilters: React.FC = (props) => {
  return (
    <Filter {...props}>
      <TextInput label="name" source="name" alwaysOn size="small" />
      <ReferenceArrayInput
        source="members"
        reference="actors"
        alwaysOn
        size="small"
        filterToQuery={(ids: string[]) => ({
          members: ids,
        })}
      >
        <AutocompleteArrayInput
          source="id"
          optionText={(r: any) => {
            return r?.fullName !== undefined ? `${r.fullName}` : "No actor";
          }}
        />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const GroupList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} perPage={50} filters={<GroupFilters />}>
    <Datagrid
      rowClick="edit"
      rowStyle={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <AvatarField source="avatar" fullWidth={false} />
      <TextField source="name" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformGroup = (data: Record): Record | Promise<Record> => {
  if (data.avatar?.rawFile) {
    return pipe(
      uploadImages(apiProvider)("groups", data.id as string, [
        data.avatar.rawFile,
      ]),
      TE.map((locations) => ({ ...data, avatar: locations[0] }))
    )().then((result) => {
      if (E.isLeft(result)) {
        throw result.left;
      }
      return result.right;
    });
  }
  return { ...data };
};

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <Typography>Group {record.name}</Typography>;
};

export const GroupEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <Edit
      title={<EditTitle {...props} />}
      {...props}
      actions={
        <>
          <WebPreviewButton
            resource="/dashboard/groups"
            source="id"
            record={{ id: props.id } as any}
          />
        </>
      }
      transform={transformGroup}
    >
      <TabbedForm redirect={false}>
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
          <RichTextInput source="body" />
        </FormTab>
        <FormTab label="Body2">
          <RichTextInput source="excerpt" />
          <ReactPageInput source="body2" />
        </FormTab>
        <FormTab label="Members">
          <ReferenceArrayGroupMemberInput source="groupsMembers" />
          <ReferenceArrayField source="members" reference="groups-members">
            <Datagrid>
              <ReferenceField source="id" reference="groups-members">
                <TextField source="id" />
              </ReferenceField>
              <ReferenceField
                label="Actor"
                source="actor.id"
                reference="actors"
              >
                <TextField source="username" />
              </ReferenceField>
              <DateField source="startDate" />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="events">
          <ReferenceManyField
            label="groups"
            target="groups[]"
            reference="events"
          >
            <Datagrid rowClick="edit">
              <TextField source="title" />
              <DateField source="startDate" />
              <DateField source="endDate" />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab label="Preview">
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              return pipe(
                io.http.Group.Group.decode(formData),
                E.fold(ValidationErrorsLayout, (p) => (
                  <GroupPageContent
                    {...p}
                    groupsMembers={[]}
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
};

export const GroupCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Group"
    {...props}
    transform={(g) => transformGroup({ ...g, id: uuid() })}
  >
    <SimpleForm>
      <ColorInput source="color" />
      <DateInput source="date" />
      <TextInput source="name" />
      <GroupKindInput source="kind" />
      <ReferenceArrayGroupMemberInput source="members" />
      <ImageInput source="avatar">
        <ImageField src="src" />
      </ImageInput>
      <ReactPageInput source="body" defaultValue="" />
    </SimpleForm>
  </Create>
);
