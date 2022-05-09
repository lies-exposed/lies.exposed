import * as ScientificStudy from "@liexp/shared/io/http/Events/ScientificStudy";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormTab,
  List,
  ListProps,
  ReferenceArrayField,
  ReferenceField,
  SimpleForm,
  TextField,
  TextInput,
  TabbedForm,
  RaRecord,
  useRecordContext,
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import ReferenceGroupInput from "../Common/ReferenceGroupInput";
import { ReferenceMediaDataGrid } from "../Common/ReferenceMediaDataGrid";
import URLMetadataInput from "../Common/URLMetadataInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const ListFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <BooleanInput label="Draft only" source="withDrafts" alwaysOn />
      <ReferenceArrayActorInput source="payload.authors" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const ScientificStudiesList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<ListFilter />}
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

export const ScientificStudyEventTitle: React.FC<{
  record?: ScientificStudy.ScientificStudy;
}> = ({ record }) => {
  return <span>Scientific Study: {record?.payload?.title}</span>;
};

export const EditScientificStudyEvent: React.FC<
  EditProps & { record?: RaRecord }
> = (props) => {
  return (
    <FormTab {...(props as any)} label="Payload">
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
    </FormTab>
  );
};

export const ScientificStudyEdit: React.FC = () => {
  const record = useRecordContext<ScientificStudy.ScientificStudy>();
  return (
    <Edit
      title={<ScientificStudyEventTitle record={record} />}
      actions={
        <>
          <WebPreviewButton resource="/dashboard/events" source="id" />
        </>
      }
      transform={(r) => transformEvent(r.id, r)}
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
          <ReferenceArrayLinkInput source="links" defaultValue={[]} />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput source="body" />
        </FormTab>

        <FormTab label="media">
          <MediaArrayInput source="newMedia" defaultValue={[]} />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
      </TabbedForm>
    </Edit>
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
