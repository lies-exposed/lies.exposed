import { http } from "@liexp/shared/lib/io/index.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import { createExcerptValue } from "@liexp/shared/lib/slate/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import { ActorDataGrid } from "@liexp/ui/lib/components/admin/actors/ActorDataGrid.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { CreateEventButton } from "@liexp/ui/lib/components/admin/events/CreateEventButton.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import { EventsFlowGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview.js";
import {
  ArrayInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormDataConsumer,
  FormTab,
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
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";

const actorFilters = [
  <TextInput
    key="search"
    label="fullName"
    source="search"
    alwaysOn
    size="small"
  />,
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
  async (id: string, data: RaRecord): Promise<RaRecord> => {
    if (data._from === "url") {
      return data;
    }
    const imagesTask = data.avatar?.rawFile
      ? uploadImages(dataProvider)("actors", id, [
          { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
        ])
      : TE.right([{ location: data.avatar }]);

    // eslint-disable-next-line @typescript-eslint/return-await
    return pipe(
      imagesTask,
      TE.map(([avatar]) => ({
        ...data,
        id,
        avatar: avatar.location,
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
      transform={({ newMemberIn = [], ...a }) =>
        transformActor(dataProvider)(a.id, {
          ...a,
          memberIn: a.memberIn.concat(
            newMemberIn.map((m: any) => ({
              ...m,
              endDate: m.endDate !== "" ? m.endDate : undefined,
            })),
          ),
        })
      }
    >
      <TabbedForm>
        <FormTab label="generals">
          <MediaField source="avatar" type="image/jpeg" controls={false} />
          <ColorInput source="color" />
          <TextInput source="username" />
          <TextInput source="fullName" />
          <DateInput source="bornOn" />
          <DateInput source="diedOn" />
          <ReactPageInput source="excerpt" onlyText={true} />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </FormTab>
        <FormTab label="Avatar">
          <ImageInput source="avatar">
            <ImageField source="src" />
          </ImageInput>
        </FormTab>

        <FormTab label="Content">
          <ReactPageInput source="body" />
        </FormTab>

        <FormTab label="Groups">
          <ArrayInput source="newMemberIn" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceGroupInput source="group" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              <ReactPageInput onlyText={true} source="body" />
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
            transform={async (t, r: any) => {
              if (t === http.Events.EventTypes.DEATH.value) {
                return {
                  draft: true,
                  type: t,
                  excerpt: createExcerptValue(""),
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
              return await Promise.reject(new Error(`Can't create event ${t}`));
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
              return <TextInput source="search" />;
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
                  <TextInput source="fullName" />
                  <TextInput source="username" />
                  <DateInput source="bornOn" />
                  <DateInput source="diedOn" />
                </Grid>
                <Grid item md={6} sm={12}>
                  <ImageInput source="avatar">
                    <ImageField />
                  </ImageInput>
                </Grid>
                <Grid item md={12}>
                  <ReactPageInput source="excerpt" onlyText={true} />
                  <ReactPageInput source="body" />
                </Grid>
              </Grid>
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};
