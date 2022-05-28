import { DEATH } from "@liexp/shared/io/http/Events/Death";
import * as React from "react";
import {
  AutocompleteArrayInput,
  BooleanInput,
  Button,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormTab,
  FunctionField,
  List,
  ReferenceArrayInput,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  useRefresh
} from "react-admin";
import { MediaField } from "../components/Common/MediaField";
import ReferenceArrayEventInput from "../components/Common/ReferenceArrayEventInput";
import ReferenceGroupInput from "../components/Common/ReferenceGroupInput";
import URLMetadataInput from "../components/Common/URLMetadataInput";
import { apiProvider } from "@client/HTTPAPI";

const RESOURCE = "links";

const linksFilter = [
  <TextInput key="title" source="title" alwaysOn />,
  <ReferenceArrayInput key="events" source="events" reference="events" alwaysOn>
    <AutocompleteArrayInput optionText="payload.title" size="small" />
  </ReferenceArrayInput>,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn />,
];

export const LinkList: React.FC = () => (
  <List
    resource={RESOURCE}
    filters={linksFilter}
    perPage={20}
    filterDefaultValues={{ _sort: "createdAt", _order: "DESC" }}
  >
    <Datagrid rowClick="edit">
      <TextField source="title" />
      <MediaField source="image.thumbnail" type="image/jpeg" />
      <DateField source="publishDate" />
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

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Link {record?.title}</span>;
};

export const LinkEdit: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  return (
    <Edit
      redirect={false}
      title={<EditTitle />}
      actions={
        <>
          <Button
            label="resources.links.actions.update_metadata"
            onClick={() => {
              void apiProvider
                .put(`/links/${record?.id}/metadata`)
                .then(() => refresh());
            }}
          />
        </>
      }
      transform={({ newEvents, ...r }) => {
        return {
          ...r,
          events: (r.events ?? []).concat(newEvents ?? []),
        };
      }}
    >
      <TabbedForm>
        <FormTab label="General">
          <TextInput source="title" fullWidth />
          <URLMetadataInput source="url" type="Link" />
          <MediaField source="image.location" type="image/jpeg" />
          <TextInput source="description" fullWidth />
          <DateInput source="publishDate" />
          <ReferenceGroupInput source="provider" />
        </FormTab>
        <FormTab label="Events">
          <ReferenceArrayEventInput
            source="newEvents"
            reference="events"
            defaultValue={[]}
          />
          <ReferenceManyField reference="events" target="links[]">
            <Datagrid rowClick="edit">
              <FunctionField
                render={(r: any) => {
                  switch (r.type) {
                    case DEATH.value:
                      return `${r.type}: ${r.payload.victim}`;
                    default:
                      return `${r.type}: ${r.payload.title}`;
                  }
                }}
              />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const LinkCreate: React.FC = () => {
  return (
    <Create title="Create a Link">
      <SimpleForm>
        <URLMetadataInput source="url" type={"Link"} />
        <DateInput source="publishDate" />
        <ReferenceArrayEventInput
          source="events"
          reference="events"
          defaultValue={[]}
        />
      </SimpleForm>
    </Create>
  );
};
