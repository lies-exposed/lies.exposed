import * as ScientificStudy from "@econnessione/shared/io/http/Events/ScientificStudy";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
import * as React from "react";
import {
  AutocompleteArrayInput,
  AutocompleteInput,
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
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  SimpleForm,
  TextField,
  TextInput
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import ReferenceGroupInput from "../Common/ReferenceGroupInput";
import URLMetadataInput from "../Common/URLMetadataInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const ListFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
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
    filter={{ type: "ScientificStudy" }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
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
  record: ScientificStudy.ScientificStudy;
}> = ({ record }: any) => {
  return <span>Scientific Study: {record.payload.title}</span>;
};

export const EditScientificStudyEvent: React.FC = (props) => {
  return (
    <FormTab label="Payload" {...props}>
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

export const ScientificStudyEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<ScientificStudyEventTitle {...(props as any)} />}
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <SimpleForm>
      <WebPreviewButton resource="/dashboard/events" source="id" />
      <TextInput
        source="type"
        defaultValue={ScientificStudy.ScientificStudyType.value}
        hidden
      />
      <BooleanInput source="draft" />
      <TextInput source="payload.title" />
      <URLMetadataInput source="payload.url" />
      <DateInput source="date" />
      <ReactPageInput source="excerpt" />
      <ReactPageInput source="body" />
      <ReferenceArrayActorInput source="payload.authors" />
      <ReferenceInput source="payload.publisher" reference="groups">
        <AutocompleteInput source="id" optionText="name" />
      </ReferenceInput>
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      <MediaArrayInput source="newMedia" defaultValue={[]} />
    </SimpleForm>
  </Edit>
);

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Scientific Study"
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <SimpleForm>
      <TextInput
        source="type"
        defaultValue={ScientificStudy.ScientificStudyType.value}
      />
      <BooleanInput source="draft" defaultValue={false} />
      <URLMetadataInput source="payload.url" />
      <TextInput source="payload.title" />
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
      <MediaArrayInput source="newMedia" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
