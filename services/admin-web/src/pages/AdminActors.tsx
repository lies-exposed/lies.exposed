import { throwTE } from "@liexp/shared/utils/task.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  ArrayInput,
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput, EditProps, FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  RaRecord,
  ReferenceArrayField,
  ReferenceInput,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";
import { AvatarField } from "../components/Common/AvatarField";
import { ColorInput } from "../components/Common/ColorInput";
import { EditFormWithPreview } from "../components/Common/EditEventForm";
import { MediaField } from "../components/Common/MediaField";
import ReferenceArrayEventInput from "../components/Common/ReferenceArrayEventInput";
import ReferenceManyEventField from "../components/Common/ReferenceManyEventField";
import { SearchLinksButton } from "../components/Common/SearchLinksButton";
import { WebPreviewButton } from "../components/Common/WebPreviewButton";
import ActorPreview from "../components/previews/ActorPreview";
import { dataProvider } from "@client/HTTPAPI";
import { uploadImages } from "@client/MediaAPI";

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

const transformActor = async (
  id: string,
  data: RaRecord
): Promise<RaRecord> => {
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
  return (
    <EditFormWithPreview
      title={<EditTitle />}
      {...props}
      actions={<EditActions />}
      preview={<ActorPreview />}
      transform={({ newMemberIn = [], ...a }) =>
        transformActor(a.id, {
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
          <ReferenceArrayEventInput source="newEvents" />
          <ReferenceManyEventField source="id" target="actors[]" />
        </FormTab>
      </TabbedForm>
    </EditFormWithPreview>
  );
};

export const ActorCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create an Actor"
    transform={(a) => transformActor(uuid(), a)}
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
