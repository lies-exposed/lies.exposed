import { Link } from "@econnessione/shared/io/http/Link";
import * as React from "react";
import {
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Filter,
  List,
  ListProps,
  ReferenceArrayInput,
  Resource,
  ResourceProps,
  SelectArrayInput,
  SimpleForm,
  TextField,
  TextInput,
  UrlField,
  Edit,
  EditProps,
  ReferenceArrayField,
  ReferenceManyField,
  AutocompleteInput,
  FunctionField,
} from "react-admin";

const RESOURCE = "links";

const LinksFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <ReferenceArrayInput source="events" reference="events" alwaysOn>
        <AutocompleteArrayInput optionText="title" />
      </ReferenceArrayInput>
    </Filter>
  );
};

export const LinkList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={<LinksFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <TextField source="description" />
      <TextField source="provider" />
      <FunctionField
        label="resources.links.fields.events_length"
        render={(r: any | undefined) => (r ? r.events.length : "-")}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Link {record.title}</span>;
};

export const LinkEdit: React.FC<EditProps> = (props: EditProps) => (
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
      <TextInput source="title" />
      <TextInput type="url" source="url" />
      <TextInput source="description" />
      <TextInput source="provider" />
      <ReferenceArrayInput source="newEvents" reference="events">
        <AutocompleteArrayInput optionText="title" />
      </ReferenceArrayInput>
      <ReferenceManyField reference="events" target="links[]">
        <Datagrid>
          <TextField source="title" />
        </Datagrid>
      </ReferenceManyField>
    </SimpleForm>
  </Edit>
);

export const LinkCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create title="Create a Link" {...props}>
      <SimpleForm>
        <TextInput type="url" source="url" />
        <ReferenceArrayInput
          source="events"
          reference="events"
          defaultValue={[]}
        >
          <SelectArrayInput optionText="title" />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  );
};

export const AdminLinksResource: React.FC<ResourceProps> = (props) => {
  return (
    <Resource
      {...props}
      name={RESOURCE}
      list={LinkList}
      edit={LinkEdit}
      create={LinkCreate}
    />
  );
};
