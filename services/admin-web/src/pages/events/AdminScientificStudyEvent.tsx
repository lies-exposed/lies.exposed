import * as ScientificStudy from "@liexp/shared/io/http/Events/ScientificStudy";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
  FormTab,
  List,
  ListProps,
  RaRecord,
  ReferenceArrayField,
  ReferenceField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
} from "react-admin";
import { AvatarField } from "../../components/Common/AvatarField";
import { EditFormWithPreview } from "../../components/Common/EditEventForm";
import { MediaArrayInput } from "../../components/Common/MediaArrayInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceGroupInput from "../../components/Common/ReferenceGroupInput";
import { ReferenceMediaDataGrid } from "../../components/Common/ReferenceMediaDataGrid";
import URLMetadataInput from "../../components/Common/URLMetadataInput";
import EventPreview from "../../components/previews/EventPreview";
import { ReferenceLinkTab } from "../../components/tabs/ReferenceLinkTab";
import { transformEvent } from "../../utils";
import { EventEditActions } from "./actions/EditEventActions";

const listFilter = [
  <TextInput key="title" source="title" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  <ReferenceArrayActorInput key="authors" source="authors" />,
  <DateInput key="date" source="date" />,
];

export const ScientificStudiesList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={listFilter}
    perPage={20}
    filterDefaultValues={{ type: "ScientificStudy", withDrafts: true }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <BooleanField source="draft" />
      <ReferenceField source="payload.publisher" reference="groups">
        <AvatarField source="avatar" />
      </ReferenceField>
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const ScientificStudyEventTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Scientific Study: {record?.payload?.title}</span>;
};

export const EditScientificStudyEventPayload: React.FC<
  EditProps & { record?: RaRecord }
> = (props) => {
  return (
    <Box>
      <TextInput source="title" />
      <ReferenceGroupInput source="payload.publisher" />
      <ReferenceArrayActorInput source="newAuthors" />
      <ReferenceArrayField source="payload.authors" reference="actors">
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="fullName" />
          <AvatarField source="avatar" />
        </Datagrid>
      </ReferenceArrayField>
    </Box>
  );
};

export const ScientificStudyEdit: React.FC = () => {
  return (
    <EditFormWithPreview
      title={<ScientificStudyEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="General">
          <TextInput
            source="type"
            defaultValue={ScientificStudy.SCIENTIFIC_STUDY.value}
            hidden
          />

          <BooleanInput source="draft" />
          <TextInput source="payload.title" />
          <URLMetadataInput
            source="payload.url"
            type={ScientificStudy.SCIENTIFIC_STUDY.value}
          />
          <DateInput source="date" />
          <ReactPageInput source="excerpt" onlyText />
          <ReferenceArrayKeywordInput
            source="keywords"
            defaultValue={[]}
            showAdd
          />
          <ReferenceArrayActorInput source="payload.authors" />
          <ReferenceGroupInput source="payload.publisher" />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput source="body" />
        </FormTab>

        <FormTab label="media">
          <MediaArrayInput source="newMedia" defaultValue={[]} />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
        <FormTab label="links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditFormWithPreview>
  );
};

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Scientific Study"
    {...props}
    // transform={(r) => transformEvent(r.id as any, r)}
  >
    <SimpleForm>
      {/* <TextInput
        source="type"
        defaultValue={ScientificStudy.ScientificStudyType.value}
      /> */}
      {/* <BooleanInput source="draft" defaultValue={false} /> */}
      <URLMetadataInput
        source="url"
        type={ScientificStudy.SCIENTIFIC_STUDY.value}
      />
      {/* <TextInput source="payload.title" />
      <DateInput source="date" />
      <ReactPageInput source="excerpt" onlyText />
      <ReactPageInput source="body" />
      <ReferenceArrayInput
        source="payload.authors"
        reference="actors"
        initialValue={[]}
      >
        <AutocompleteArrayInput source="id" optionText="fullName" />
      </ReferenceArrayInput>
      <ReferenceInput source="payload.publisher" reference="groups" alwaysOn>
        <AutocompleteInput source="id" optionText="name" />
      </ReferenceInput>
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      <MediaArrayInput source="newMedia" defaultValue={[]} /> */}
    </SimpleForm>
  </Create>
);
