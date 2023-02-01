import { http } from "@liexp/shared/io";
import { createExcerptValue } from "@liexp/shared/slate";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { uploadImages } from "@liexp/ui/client/admin/MediaAPI";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import { WebPreviewButton } from "@liexp/ui/components/admin/common/WebPreviewButton";
import { ColorInput } from "@liexp/ui/components/admin/common/inputs/ColorInput";
import { CreateEventButton } from "@liexp/ui/components/admin/events/CreateEventButton";
import ReferenceManyEventField from "@liexp/ui/components/admin/events/ReferenceManyEventField";
import { SearchLinksButton } from "@liexp/ui/components/admin/links/SearchLinksButton";
import { MediaField } from "@liexp/ui/components/admin/media/MediaField";
import ActorPreview from "@liexp/ui/components/admin/previews/ActorPreview";
import * as O from 'fp-ts/Option';
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as React from "react";
import {
  ArrayInput,
  AutocompleteInput,
  Create,
  type CreateProps,
  Datagrid,
  type DataProvider,
  DateField,
  DateInput,
  type EditProps,
  FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  type RaRecord,
  ReferenceArrayField,
  ReferenceInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext
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
              <ReferenceInput source="group" reference="groups">
                <AutocompleteInput optionText="name" />
              </ReferenceInput>
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
        <ColorInput source="color" />
        <TextInput source="username" />
        <TextInput source="fullName" />
        <ImageInput source="avatar">
          <ImageField />
        </ImageInput>
        <ReactPageInput source="excerpt" onlyText={true} />
        <ReactPageInput source="body" />
      </SimpleForm>
    </Create>
  );
};
