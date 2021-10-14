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
      <ImageField source="image" />
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

export const LinkEdit: React.FC<EditProps> = (props: EditProps) => {
  const refresh = useRefresh();
  return (
    <Edit
      title={<EditTitle {...props} />}
      actions={
        <>
          <Button
            label="resources.links.actions.update_metadata"
            onClick={async () => {
              await apiProvider
                .put(`/links/${props.id}/metadata`)
                .then(() => refresh());
            }}
          />
        </>
      }
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
        <ImageField source="image" />
        <MarkdownInput source="description" />
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
};

export const LinkCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create title="Create a Link" {...props}>
      <SimpleForm>
        <TextInput type="url" source="url" />
        <DateInput source="publishDate" />
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
