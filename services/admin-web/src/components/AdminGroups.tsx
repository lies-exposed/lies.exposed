import * as io from "@liexp/shared/io";
import { Media } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { GroupPageContent } from "@liexp/ui/components/GroupPageContent";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Typography } from "@material-ui/core";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
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
  ReferenceArrayInput,
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
import ReferenceActorInput from "./Common/ReferenceActorInput";
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

const GroupMemberArrayInput: React.FC<Omit<ArrayInputProps, "children">> = (
  props
) => {
  return (
    <ArrayInput source="members" {...props}>
      <SimpleFormIterator>
        <ReferenceActorInput source="actor" />
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <ReactPageInput onlyText={true} source="body" />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

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

const transformGroup = ({
  newMembers,
  ...data
}: Record): Record | Promise<Record> => {
  const uploadAvatar = data.avatar?.rawFile
    ? uploadImages(apiProvider)("groups", data.id as string, [
        { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
      ])
    : TE.right([
        { location: data.avatar, type: "image/jpeg" as Media.MediaType },
      ]);

  const members = (data.members ?? []).concat(newMembers ?? []);

  return pipe(
    uploadAvatar,
    TE.map((locations) => ({
      ...data,
      excerpt: data.excerpt ?? undefined,
      avatar: locations[0].location,
      members,
    }))
  )().then((result) => {
    if (E.isLeft(result)) {
      throw result.left;
    }
    return result.right;
  });
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
          <ReactPageInput label="excerpt" source="excerpt" />
          <ReactPageInput label="body" source="body" />
        </FormTab>
        <FormTab label="Members">
          <ArrayInput source="newMembers" defaultValue={[]}>
            <SimpleFormIterator>
              <ReferenceActorInput source="actor" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              <ReactPageInput onlyText={true} source="body" />
            </SimpleFormIterator>
          </ArrayInput>

          <ReferenceManyField reference="groups-members" target="group">
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="actor.username" />
              <DateField source="startDate" />
            </Datagrid>
          </ReferenceManyField>
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
                    ownedGroups={[]}
                    subGroups={[]}
                    onGroupClick={() => {}}
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
      <GroupMemberArrayInput source="members" />
      <ImageInput source="avatar">
        <ImageField src="src" />
      </ImageInput>
      <ReactPageInput source="excerpt" onlyText />
      <ReactPageInput source="body" />
    </SimpleForm>
  </Create>
);
