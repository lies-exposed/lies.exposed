import { UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import { EntitreeGraph } from "@liexp/ui/lib/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { ActorDataGrid } from "@liexp/ui/lib/components/admin/actors/ActorDataGrid.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import { CreateEventButton } from "@liexp/ui/lib/components/admin/events/CreateEventButton.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import { EventsFlowGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview.js";
import {
  ArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  ReferenceArrayField,
  SelectInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  type CreateProps,
  type EditProps,
  type RaRecord,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { LazyFormTabContent } from "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { toError } from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";

const actorFilters = [
  <TextInput key="search" label="fullName" source="q" alwaysOn size="small" />,
];

export const ActorList: React.FC = () => (
  <List
    resource="actors"
    filters={actorFilters}
    perPage={50}
    sort={{ field: "createdAt", order: "DESC" }}
  >
    <ActorDataGrid />
  </List>
);

const transformActor =
  (dataProvider: APIRESTClient) =>
  async (
    id: string,
    { newMemberIn = [], ...data }: RaRecord<UUID>,
  ): Promise<RaRecord> => {
    if (data._from === "wikipedia") {
      return data;
    }

    return pipe(
      TE.Do,
      TE.bind("avatar", (): TE.TaskEither<Error, Partial<Media>[]> => {
        if (data.avatar?.rawFile) {
          return pipe(
            uploadImages(dataProvider)("actors", id, [
              { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
            ]),
          );
        }

        if (!UUID.is(data.avatar)) {
          return TE.right([
            {
              location: data.avatar,
              type: contentTypeFromFileExt(data.avatar),
            },
          ]);
        }
        return TE.right([{ id: data.avatar }]);
      }),
      TE.bind("avatarMedia", ({ avatar }) => {
        if (UUID.is(avatar[0].id)) {
          return TE.right({ id: avatar[0].id });
        }
        return pipe(
          TE.tryCatch(
            () =>
              dataProvider.create("media", {
                data: {
                  ...avatar[0],
                  events: [],
                  links: [],
                  keywords: [],
                  areas: [],
                  label: data.fullName,
                  description: data.fullName,
                },
              }),
            toError,
          ),
          TE.map((r) => r.data),
        );
      }),
      TE.map(({ avatarMedia }) => ({
        ...data,
        body: data.body,
        excerpt: data.excerpt,
        id,
        avatar: avatarMedia.id,
        memberIn: data.memberIn.concat(
          newMemberIn.map((m: any) => ({
            ...m,
            endDate: m.endDate !== "" ? m.endDate : undefined,
          })),
        ),
      })),
      throwTE,
    );
  };

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Actor {record?.fullName}</span>;
};

const EditActions: React.FC = () => {
  const record = useRecordContext();
  return (
    <>
      {record?.fullName ? <SearchLinksButton query={record.fullName} /> : null}
    </>
  );
};

export const ActorEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<EditTitle />}
      {...props}
      actions={<EditActions />}
      preview={<ActorPreview />}
      transform={(a) => transformActor(dataProvider)(a.id, a)}
    >
      <TabbedForm>
        <FormTab label="generals">
          <MediaField
            source="avatar.thumbnail"
            type="image/jpeg"
            controls={false}
          />
          <ColorInput source="color" />
          <TextWithSlugInput source="fullName" slugSource="username" />
          <DateInput source="bornOn" />
          <DateInput source="diedOn" />
          <BlockNoteInput source="excerpt" onlyText={true} />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
        <FormTab label="Avatar">
          <ReferenceMediaInput source="avatar.id" />
          <FunctionField
            render={(r) => {
              if (!r.avatar) {
                return (
                  <ImageInput source="avatar">
                    <ImageField source="thumbnail" />
                  </ImageInput>
                );
              }
              return null;
            }}
          />
        </FormTab>

        <FormTab label="Content">
          <BlockNoteInput source="body" />
        </FormTab>

        <FormTab label="Groups">
          <ArrayInput source="newMemberIn" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceGroupInput source="group" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              <BlockNoteInput onlyText={true} source="body" />
            </SimpleFormIterator>
          </ArrayInput>

          <ReferenceArrayField source="memberIn" reference="groups-members">
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="group.name" />
              <DateField source="startDate" />
              <DateField source="endDate" defaultValue={undefined} />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>
        <FormTab label="Events">
          <ReferenceManyEventField source="id" target="actors[]" />
          <CreateEventButton
            transform={async (t, r) => {
              if (t === http.Events.EventTypes.DEATH.value) {
                return {
                  draft: true,
                  type: t,
                  excerpt: undefined,
                  body: undefined,
                  date: new Date(),
                  payload: {
                    victim: r.id,
                    location: O.none,
                  },
                  media: [],
                  keywords: [],
                  links: [],
                };
              }
              return Promise.reject(new Error(`Can't create event ${t}`));
            }}
          />
        </FormTab>
        <FormTab label="networks">
          <LazyFormTabContent tab={5}>
            <EventsNetworkGraphFormTab type="actors" />
          </LazyFormTabContent>
        </FormTab>
        <FormTab label="flows">
          <LazyFormTabContent tab={6}>
            <EventsFlowGraphFormTab type="actors" />
          </LazyFormTabContent>
        </FormTab>
        <FormTab label="Entitree">
          <div style={{ height: 600, width: "100%" }}>
            <EntitreeGraph />
          </div>
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const ActorCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      {...props}
      title="Create an Actor"
      transform={(a) => transformActor(dataProvider)(uuid(), a)}
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
              return <TextInput source="q" />;
            }

            return (
              <Grid container spacing={2}>
                <Grid
                  item
                  md={6}
                  sm={12}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <ColorInput
                    source="color"
                    defaultValue={generateRandomColor()}
                  />
                  <TextWithSlugInput source="fullName" slugSource="username" />
                  <DateInput source="bornOn" />
                  <DateInput source="diedOn" />
                </Grid>
                <Grid item md={6} sm={12}>
                  <ImageInput source="avatar">
                    <ImageField source="thumbnail" />
                  </ImageInput>
                </Grid>
                <Grid item md={12}>
                  <BlockNoteInput source="excerpt" onlyText={true} />
                  <BlockNoteInput source="body" />
                </Grid>
              </Grid>
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
