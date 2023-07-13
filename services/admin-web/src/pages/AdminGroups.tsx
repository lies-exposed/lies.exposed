import * as io from "@liexp/shared/lib/io";
import { type Media } from "@liexp/shared/lib/io/http";
import { parseDate } from "@liexp/shared/lib/utils/date";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI";
import {
  ArrayInput,
  AutocompleteArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  FormTab,
  ImageField,
  ImageInput,
  List,
  ReferenceArrayInput,
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext,
  type ArrayInputProps,
  type CreateProps,
  type DataProvider,
  type EditProps,
  type RaRecord,
  type SelectInputProps,
} from "@liexp/ui/lib/components/admin";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import { WebPreviewButton } from "@liexp/ui/lib/components/admin/common/WebPreviewButton";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField";
import { GroupDataGrid } from "@liexp/ui/lib/components/admin/groups/GroupDataGrid";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField";
import GroupPreview from "@liexp/ui/lib/components/admin/previews/GroupPreview";
import { Box, Grid, Typography } from "@liexp/ui/lib/components/mui";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";

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
  props,
) => {
  return (
    <ArrayInput {...props}>
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
    filterToQuery={(ids: string[]) => ({
      members: ids,
    })}
  >
    <AutocompleteArrayInput
      source="id"
      optionText={(r: any) => {
        return r?.fullName !== undefined ? `${r.fullName}` : "No actor";
      }}
      size="small"
    />
  </ReferenceArrayInput>,
];

export const GroupList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={groupFilters}>
    <GroupDataGrid />
  </List>
);

const transformGroup =
  (apiProvider: DataProvider) =>
  (data: RaRecord): RaRecord | Promise<RaRecord> => {
    if (data._from === "wikipedia") {
      return data;
    }

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
        startDate: data.startDate?.includes("T")
          ? data.startDate
          : parseDate(data.startDate).toISOString(),
        endDate: data.endDate
          ? data.endDate.includes("T")
            ? data.endDate
            : parseDate(data.endDate).toISOString()
          : undefined,
        members,
      })),
      throwTE,
    );
  };

const EditTitle: React.FC<EditProps> = () => {
  const record = useRecordContext();
  return <Typography>Group {record?.name}</Typography>;
};

export const GroupEdit: React.FC<EditProps> = (props: EditProps) => {
  const dataProvider = useDataProvider();
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
      transform={transformGroup(dataProvider)}
      preview={<GroupPreview />}
      redirect={false}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <Grid container spacing={2}>
            <Grid item md={6}>
              <Box style={{ display: "flex", flexDirection: "column" }}>
                <TextInput source="name" />
                <TextInput source="username" />
                <ColorInput source="color" />
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <DateInput source="startDate" />
                  <DateInput source="endDate" />
                </Box>
              </Box>
            </Grid>
            <Grid item md={6}>
              <GroupKindInput source="kind" />
              <MediaField source="avatar" type="image/jpeg" />
              <Box style={{ display: "flex", flexDirection: "column" }}>
                <DateField source="updatedAt" showTime={true} />
                <DateField source="createdAt" showTime={true} />
              </Box>
            </Grid>
          </Grid>
          <ReactPageInput label="excerpt" source="excerpt" />
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
          <ArrayInput source="newMembers" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceActorInput source="actor" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
            </SimpleFormIterator>
          </ArrayInput>

          <ReferenceManyField
            reference="groups-members"
            target="group"
            fullWidth
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <AvatarField source="actor.avatar" />
              <TextField source="actor.fullName" />
              <DateField source="startDate" />
              <DateField source="endDate" />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab label="events">
          <ReferenceManyEventField source="id" target="groups[]" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const GroupCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Group"
      {...props}
      transform={(g) => transformGroup(dataProvider)({ ...g, id: uuid() })}
    >
      <SimpleForm>
        <SelectInput
          source="_from"
          choices={["wikipedia", "plain"].map((id) => ({ id, name: id }))}
          defaultValue="plain"
        />
        <FormDataConsumer>
          {({ formData }) => {
            if (formData._from === "wikipedia") {
              return <TextInput source="search" />;
            }

            return (
              <Box>
                <ColorInput source="color" />
                <DateInput source="startDate" />
                <DateInput source="endDate" />
                <TextInput source="name" />
                <TextInput source="username" />
                <GroupKindInput source="kind" />
                <GroupMemberArrayInput source="members" />
                <ImageInput source="avatar">
                  <ImageField src="src" />
                </ImageInput>
                <ReactPageInput source="excerpt" onlyText />
                <ReactPageInput source="body" />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
