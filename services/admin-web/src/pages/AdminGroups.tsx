import { UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Group } from "@liexp/shared/lib/io/http/Group.js";
import { OpenAISummarizeQueueType } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { parseDate } from "@liexp/shared/lib/utils/date.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import { EventsFlowGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js";
import { GroupDataGrid } from "@liexp/ui/lib/components/admin/groups/GroupDataGrid.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import { OpenAIEmbeddingJobButton } from "@liexp/ui/lib/components/admin/media/OpenAIJobButton.js";
import { ReferenceMediaInputWithUpload } from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInputWithUpload.js";
import GroupPreview from "@liexp/ui/lib/components/admin/previews/GroupPreview.js";
import {
  ArrayInput,
  AutocompleteArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  List,
  ReferenceManyField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  type ArrayInputProps,
  type CreateProps,
  type EditProps,
  type RaRecord,
  type SelectInputProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { LazyFormTabContent } from "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js";
import { EditToolbar } from "@liexp/ui/lib/components/admin/toolbar/index.js";
import {
  Box,
  Grid,
  Stack,
  Typography,
} from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { Schema } from "effect";
import { toError } from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";

const RESOURCE = "groups";

const GroupKindInput: React.FC<SelectInputProps> = (props) => {
  return (
    <SelectInput
      {...props}
      choices={io.http.Group.GroupKind.members.map((t) => ({
        id: t.literals[0],
        name: t.literals[0],
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
        <BlockNoteInput onlyText={true} source="body" />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

const groupFilters = [
  <TextInput key="search" label="name" source="q" alwaysOn size="small" />,
  <ReferenceManyField
    key="members"
    source="members"
    reference="actors"
    target="members"
  >
    <AutocompleteArrayInput
      source="id"
      optionText={(r) => {
        return r?.fullName !== undefined ? `${r.fullName}` : "No actor";
      }}
      size="small"
    />
  </ReferenceManyField>,
];

export const GroupList: React.FC = () => (
  <List resource={RESOURCE} perPage={50} filters={groupFilters}>
    <GroupDataGrid />
  </List>
);

const transformGroup =
  (apiProvider: APIRESTClient) =>
  (data: RaRecord<UUID>): RaRecord | Promise<RaRecord> => {
    if (data._from === "wikipedia") {
      return data;
    }

    const newMembers = (data.newMembers ?? []).map((m: any) => ({
      ...m,
      body: m.excerpt ?? null,
    }));
    const members = (data.members ?? []).concat(newMembers);

    // Extract newAvatarUpload from data
    const { newAvatarUpload, ...restData } = data;

    return pipe(
      TE.Do,
      TE.bind("avatar", (): TE.TaskEither<Error, Partial<Media.Media>[]> => {
        // New avatar upload takes precedence
        if (newAvatarUpload?.rawFile) {
          return pipe(
            uploadImages(apiProvider)("groups", restData.id, [
              {
                file: newAvatarUpload.rawFile,
                type: newAvatarUpload.rawFile.type,
              },
            ]),
          );
        }

        if (restData.avatar?.rawFile) {
          return pipe(
            uploadImages(apiProvider)("groups", restData.id, [
              {
                file: restData.avatar.rawFile,
                type: restData.avatar.rawFile.type,
              },
            ]),
          );
        }

        if (Schema.is(UUID)(restData.avatar?.id)) {
          return TE.right([
            {
              id: restData.avatar.id,
            },
          ]);
        }

        if (!Schema.is(UUID)(restData.avatar)) {
          return TE.right([
            {
              id: restData.avatar.id,
            },
          ]);
        }

        return TE.right([]);
      }),
      TE.bind("avatarMedia", ({ avatar }) => {
        if (Schema.is(UUID)(avatar[0]?.id)) {
          return TE.right({ id: avatar[0].id });
        }
        return pipe(
          TE.tryCatch(
            () =>
              apiProvider.create("media", {
                data: {
                  ...avatar[0],
                  events: [],
                  links: [],
                  keywords: [],
                  areas: [],
                  label: restData.name,
                  description: restData.name,
                },
              }),
            toError,
          ),
          TE.map((r) => r.data),
        );
      }),
      TE.map(({ avatarMedia }) => ({
        ...restData,
        excerpt: restData.excerpt,
        body: restData.body,
        avatar: avatarMedia.id,
        startDate: restData.startDate
          ? restData.startDate.includes("T")
            ? restData.startDate
            : parseDate(restData.startDate).toISOString()
          : undefined,
        endDate: restData.endDate
          ? restData.endDate.includes("T")
            ? restData.endDate
            : parseDate(restData.endDate).toISOString()
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
      transform={transformGroup(dataProvider)}
      preview={<GroupPreview />}
      redirect={false}
    >
      <TabbedForm toolbar={<EditToolbar />}>
        <TabbedForm.Tab label="Generals">
          <Grid container spacing={2} width="100%">
            <Grid size={{ md: 6, lg: 9 }}>
              <Stack direction={"column"}>
                <TextWithSlugInput source="name" slugSource="username" />

                <Stack
                  direction="row"
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  spacing={2}
                >
                  <ColorInput source="color" />
                  <DateInput source="startDate" />
                  <DateInput source="endDate" />
                </Stack>
              </Stack>
            </Grid>
            <Grid size={"auto"} textAlign={"end"}>
              <GroupKindInput source="kind" />
              <MediaField
                source="avatar.thumbnail"
                type="image/jpeg"
                controls={false}
              />
              <Box style={{ display: "flex", flexDirection: "column" }}>
                <DateField source="updatedAt" showTime={true} />
                <DateField source="createdAt" showTime={true} />
              </Box>
            </Grid>
            <Grid size={12}>
              <Stack>
                <OpenAIEmbeddingJobButton<Group>
                  resource="groups"
                  type={OpenAISummarizeQueueType.Type}
                  label="Generate Organization Summary"
                  description="AI retrieves related events and generates a factual organization summary using verified Wikipedia sources"
                  transformValue={({ name, excerpt }) =>
                    pipe(
                      excerpt ? getTextContents(excerpt) : "",
                      (text) => (text !== "" ? text : name),
                      (text) => ({ text }),
                    )
                  }
                />
                <BlockNoteInput source="excerpt" />
              </Stack>
            </Grid>
          </Grid>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Avatar">
          <ReferenceMediaInputWithUpload
            source="avatar.id"
            uploadLabel="Upload new avatar"
            fullWidth
          />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Body">
          <BlockNoteInput label="body" source="body" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Members">
          <ArrayInput source="newMembers" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceActorInput source="actor" />
              <BlockNoteInput source="excerpt" />
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
              <AvatarField source="actor.avatar.thumbnail" />
              <TextField source="actor.fullName" />
              <DateField source="startDate" />
              <DateField source="endDate" />
            </Datagrid>
          </ReferenceManyField>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="events">
          <ReferenceManyEventField source="id" target="groups[]" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Network">
          <LazyFormTabContent tab={5}>
            <EventsNetworkGraphFormTab type="groups" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Flows">
          <LazyFormTabContent tab={6}>
            <EventsFlowGraphFormTab type="groups" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
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
                <ColorInput source="color" required />
                <DateInput source="startDate" required />
                <DateInput source="endDate" />
                <TextWithSlugInput
                  source="name"
                  slugSource="username"
                  required
                />
                <GroupKindInput source="kind" required />
                <GroupMemberArrayInput source="members" />
                <ReferenceMediaInputWithUpload
                  source="avatar"
                  uploadLabel="Upload avatar"
                  showPreview={false}
                  fullWidth
                />
                <BlockNoteInput source="excerpt" onlyText isRequired={true} />
                <BlockNoteInput source="body" />
              </Box>
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
