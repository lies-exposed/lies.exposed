import { ScientificStudyType } from "@econnessione/shared/io/http/Events/ScientificStudy";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
import RichTextInput from "ra-input-rich-text";
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
  List,
  ListProps,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MediaArrayInput } from "./Common/MediaArrayInput";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "./Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "./Common/ReferenceArrayLinkInput";

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
      <DateField source="publishDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Scientific Study {record.title}</span>;
};

export const ScientificStudyEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    transform={(r) => {
      return {
        ...r,
      };
    }}
  >
    <SimpleForm>
      <TextInput source="type" defaultValue={ScientificStudyType.value} hidden />
      <BooleanInput source="draft" />
      <TextInput source="payload.title" />
      <TextInput source="payload.url" type="url" />
      <DateInput source="date" />
      <ReactPageInput source="excerpt" />
      <ReactPageInput source="body" />
      <RichTextInput source="payload.conclusion" />
      <ReferenceArrayActorInput source="payload.authors" />
      <ReferenceInput source="payload.publisher" reference="groups">
        <AutocompleteInput source="id" optionText="name" />
      </ReferenceInput>
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      <MediaArrayInput source="media" defaultValue={[]} />
    </SimpleForm>
  </Edit>
);

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Scientific Study" {...props}>
    <SimpleForm>
      <TextInput source="type" defaultValue={ScientificStudyType.value} />
      <BooleanInput source="draft" defaultValue={false} />
      <TextInput source="payload.title" />
      <TextInput source="payload.url" type="url" />
      <DateInput source="date" />
      <ReactPageInput source="excerpt" onlyText />
      <ReactPageInput source="body" />
      <RichTextInput source="payload.conclusion" />
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
      <MediaArrayInput source="media" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
