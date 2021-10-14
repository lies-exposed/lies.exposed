import * as React from "react";
import {
  AutocompleteArrayInput,
  Button,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FunctionField,
  ImageField,
  List,
  ListProps,
  ReferenceArrayInput,
  ReferenceManyField,
  Resource,
  ResourceProps,
  SelectArrayInput,
  SimpleForm,
  TextField,
  TextInput,
  useRefresh,
} from "react-admin";
import MarkdownInput from "./Common/MarkdownInput";
import { apiProvider } from "@client/HTTPAPI";

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
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Keyword {record.title}</span>;
};

export const KeywordEdit: React.FC<EditProps> = (props: EditProps) => {
  const refresh = useRefresh();
  return (
    <Edit
      title={<EditTitle {...props} />}
      {...props}
      transform={({ newEvents, ...r }) => {
        return {
          ...r,
          events: (r.events ?? []).concat(newEvents ?? []),
        };
      }}
    >
      <SimpleForm>
        <TextInput source="keyword" />
      </SimpleForm>
    </Edit>
  );
};

export const KeywordCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create title="Create a Keyword" {...props}>
      <SimpleForm>
        <TextInput type="string" source="tag" />
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
