import { toColor } from "@econnessione/shared/io/http/Common";
import * as React from "react";
import {
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  Filter,
  List,
  ListProps,
  ReferenceArrayInput,
  Resource,
  ResourceProps,
  SimpleForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorField, ColorInput } from "react-admin-color-input";

const RESOURCE = "keywords";

const KeywordsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <ReferenceArrayInput source="events" reference="events" alwaysOn>
        <AutocompleteArrayInput optionText="title" />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const KeywordList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={<KeywordsFilter />}
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <TextField source="tag" />
      <ColorField source="color" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Keyword {record.title}</span>;
};

export const KeywordEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <Edit
      title={<EditTitle {...props} />}
      {...props}
      transform={({ newEvents, ...r }) => {
        return {
          ...r,
          color: toColor(r.color),
          events: (r.events ?? []).concat(newEvents ?? []),
        };
      }}
    >
      <SimpleForm>
        <TextInput source="tag" />
        <ColorInput source="color" picker="Material" />
      </SimpleForm>
    </Edit>
  );
};

export const KeywordCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create title="Create a Keyword" {...props}>
      <SimpleForm>
        <TextInput source="tag" type="string" />
        <ColorInput source="color" />
      </SimpleForm>
    </Create>
  );
};

export const AdminKeywordResource: React.FC<ResourceProps> = (props) => {
  return (
    <Resource
      {...props}
      name={RESOURCE}
      list={KeywordList}
      edit={KeywordEdit}
      create={KeywordCreate}
    />
  );
};
