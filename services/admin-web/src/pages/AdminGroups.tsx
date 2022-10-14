import * as io from "@liexp/shared/io";
import { Media } from "@liexp/shared/io/http";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { uploadImages } from "@liexp/ui/client/admin/MediaAPI";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import { ColorInput } from "@liexp/ui/components/admin/common/ColorInput";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import { MediaField } from "@liexp/ui/components/admin/common/MediaField";
import ReferenceActorInput from "@liexp/ui/components/admin/common/ReferenceActorInput";
import { WebPreviewButton } from "@liexp/ui/components/admin/common/WebPreviewButton";
import GroupPreview from "@liexp/ui/components/admin/previews/GroupPreview";
import { Typography } from "@liexp/ui/components/mui";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";
import {
  ArrayInput,
  ArrayInputProps,
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps, FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  RaRecord,
  ReferenceArrayInput,
  ReferenceManyField,
  SelectInput,
  SelectInputProps,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";
import { apiProvider } from "@client/HTTPAPI";

const RESOURCE = "groups";

const GroupKindInput: React.FC<SelectInputProps> = (props) => {
  return (
    <SelectInput
      {...props}
      choices={io.http.Group.GroupKind.types.map((t) => ({
        id: t.value,
        name: t.value,
      }))}
    />
  );
};

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

const groupFilters = [
  <TextInput key="name" label="name" source="name" alwaysOn size="small" />,
  <ReferenceArrayInput
    key="members"
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
  </ReferenceArrayInput>,
];

export const GroupList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={groupFilters}>
    <Datagrid
      rowClick="edit"
      rowStyle={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <AvatarField source="avatar" fullWidth={false} />
      <TextField source="name" />
      <FunctionField
        source="members"
        render={(r) => {
          return r.members?.length ?? 0;
        }}
      />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformGroup = (data: RaRecord): RaRecord | Promise<RaRecord> => {
  const uploadAvatar = data.avatar?.rawFile
    ? uploadImages(apiProvider)("groups", data.id as string, [
        { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
      ])
    : TE.right([
        { location: data.avatar, type: "image/jpeg" as Media.MediaType },
      ]);

  const newMembers = (data.newMembers ?? []).map((m) => ({
    ...m,
    body: {},
  }));

  const members = (data.members ?? []).concat(newMembers);

  return pipe(
    uploadAvatar,
    TE.map((locations) => ({
      ...data,
      excerpt: data.excerpt ?? undefined,
      avatar: locations[0].location,
      members,
    })),
    throwTE
  );
};

const EditTitle: React.FC<EditProps> = () => {
  const record = useRecordContext();
  return <Typography>Group {record?.name}</Typography>;
};

export const GroupEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <EditForm
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
      preview={<GroupPreview />}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextInput source="name" />
          <ColorInput source="color" />
          <DateInput source="date" />
          <GroupKindInput source="kind" />
          <ReactPageInput label="excerpt" source="excerpt" />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </FormTab>
        <FormTab label="Avatar">
          <MediaField source="avatar" type="image/jpeg" />
          <ImageInput source="avatar">
            <ImageField src="src" />
          </ImageInput>
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput label="body" source="body" />
        </FormTab>
        <FormTab label="Members">
          <ArrayInput source="newMembers" defaultValue={[]}>
            <SimpleFormIterator>
              <ReferenceActorInput source="actor" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              {/* <ReactPageInput onlyText={true} source="body" /> */}
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
      </TabbedForm>
    </EditForm>
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
