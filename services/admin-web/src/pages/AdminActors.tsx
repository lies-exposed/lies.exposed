import { http } from "@liexp/shared/lib/io";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import { WebPreviewButton } from "@liexp/ui/lib/components/admin/common/WebPreviewButton";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput";
import { CreateEventButton } from "@liexp/ui/lib/components/admin/events/CreateEventButton";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview";
import { Grid } from "@liexp/ui/lib/components/mui";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";
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
  useDataProvider,
  useRecordContext,
  type CreateProps,
  type DataProvider,
  type EditProps,
  type RaRecord,
} from "react-admin";

const actorFilters = [
  <TextInput
    key="fullName"
    label="fullName"
    source="fullName"
    alwaysOn
    size="small"
  />,
];

export const ActorList: React.FC = () => (
  <List resource="actors" filters={actorFilters} perPage={50}>
    <Datagrid
      rowClick="edit"
      rowStyle={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <TextField source="fullName" />
      <TextField source="username" />
      <AvatarField source="avatar" />
      <FunctionField label="Groups" render={(r) => r.memberIn.length} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

const transformActor =
  (dataProvider: DataProvider<string>) =>
  async (id: string, data: RaRecord): Promise<RaRecord> => {
    if (data._from === 'url') {
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
      throwTE
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
      <WebPreviewButton resource="actors" />{" "}
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
            }))
          ),
        })
      }
    >
      <TabbedForm>
        <FormTab label="generals">
          <MediaField source="avatar" type="image/jpeg" />
          <ColorInput source="color" />
          <TextInput source="username" />
          <TextInput source="fullName" />
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
          <ArrayInput source="newMemberIn" defaultValue={[]}>
            <SimpleFormIterator>
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
              if (t === http.Events.Death.DEATH.value) {
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
