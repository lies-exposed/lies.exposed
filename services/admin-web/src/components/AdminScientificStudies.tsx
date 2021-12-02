import RichTextInput from "ra-input-rich-text";
import * as React from "react";
import {
  AutocompleteArrayInput,
  AutocompleteInput,
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
  ReferenceArrayField,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceInput,
  Resource,
  ResourceProps,
  SimpleForm,
  SingleFieldList,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";

const RESOURCE = "scientific-studies";

const ListFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <ReferenceArrayActorInput source="authors" alwaysOn />
      <DateInput source="publishedDate" />
    </Filter>
  );
};

export const ScientificStudiesList: React.FC<ListProps> = (props) => (
  <List {...props} filters={<ListFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <ReferenceArrayField source="authors" reference="actors">
        <SingleFieldList>
          <AvatarField source="avatar" />
        </SingleFieldList>
      </ReferenceArrayField>
      <ReferenceField source="publisher" reference="groups">
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
      <TextInput source="title" />
      <TextInput source="url" type="url" />
      <DateInput source="publishDate" />
      <RichTextInput source="abstract" />
      <RichTextInput source="results" />
      <RichTextInput source="conclusion" />
      <ReferenceArrayActorInput source="authors" />
      <ReferenceInput source="publisher" reference="groups">
        <AutocompleteInput source="id" optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Edit>
);

export const ScientificStudyCreate: React.FC<CreateProps> = (props) => (
  <Create title="Create a Scientific Study" {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="url" type="url" />
      <DateInput source="publishDate" />
      <RichTextInput source="abstract" />
      <RichTextInput source="results" />
      <RichTextInput source="conclusion" />
      <ReferenceArrayInput
        source="authors"
        reference="actors"
        initialValue={[]}
      >
        <AutocompleteArrayInput source="id" optionText="fullName" />
      </ReferenceArrayInput>
      <ReferenceInput source="publisher" reference="groups" alwaysOn>
        <AutocompleteInput source="id" optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);

export const AdminScientificStudiesResource: React.FC<ResourceProps> = (
  props
) => {
  return (
    <Resource
      {...props}
      name={RESOURCE}
      list={ScientificStudiesList}
      edit={ScientificStudyEdit}
      create={ScientificStudyCreate}
    />
  );
};
