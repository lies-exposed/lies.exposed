import * as io from "@liexp/shared/io";
import { Box, MenuItem, Select, Toolbar } from "@liexp/ui/components/mui";
import { getSuggestions } from "@liexp/ui/helpers/event.helper";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  AutocompleteArrayInput,
  BooleanField,
  BooleanInput,
  Button,
  Create,
  CreateButton,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormTab,
  FunctionField,
  List,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { useNavigate } from "react-router";
import { MediaField } from "../components/Common/MediaField";
import ReferenceArrayEventInput from "../components/Common/ReferenceArrayEventInput";
import ReferenceGroupInput from "../components/Common/ReferenceGroupInput";
import { SearchLinksButton } from "../components/Common/SearchLinksButton";
import URLMetadataInput from "../components/Common/URLMetadataInput";
import { apiProvider } from "@client/HTTPAPI";

const RESOURCE = "links";

const linksFilter = [
  <TextInput key="search" label="Search" source="q" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  <ReferenceArrayInput key="events" source="events" reference="events" alwaysOn>
    <AutocompleteArrayInput optionText="payload.title" size="small" />
  </ReferenceArrayInput>,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn />,
];

export const LinkListActions: React.FC = () => {
  return (
    <Box>
      <CreateButton />
      <SearchLinksButton />
    </Box>
  );
};

export const LinkList: React.FC = () => (
  <List
    resource={RESOURCE}
    filters={linksFilter}
    perPage={20}
    filterDefaultValues={{ _sort: "createdAt", _order: "DESC" }}
    actions={<LinkListActions />}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        render={(r) => {
          return (
            <Box style={{ display: "flex", flexDirection: "column" }}>
              <MediaField source="image.thumbnail" type="image/jpeg" />
              <TextField
                source="title"
                style={{ fontWeight: 600, marginBottom: 5 }}
              />
              <TextField source="description" />
            </Box>
          );
        }}
      />
      <DateField source="publishDate" />
      <ReferenceField source="provider" reference="groups">
        <TextField source="name" />
      </ReferenceField>

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

const UpdateMetadataButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();

  return (
    <Button
      label="resources.links.actions.update_metadata"
      variant="contained"
      onClick={() => {
        void apiProvider
          .put(`/links/${record?.id}/metadata`)
          .then(() => refresh());
      }}
    />
  );
};

const CreateEventButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[1].value
  );

  if (record?.events?.legnth > 0) {
    return <Box />;
  }

  return (
    <Box>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
        }}
      >
        {io.http.Events.EventType.types.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.value}
          </MenuItem>
        ))}
      </Select>
      <Button
        label="Create Event"
        variant="contained"
        onClick={() => {
          void apiProvider
            .get("open-graph/metadata", { url: record.url, type: "Link" })
            .then(async ({ data: { metadata: m } }) => {
              const suggestion = getSuggestions(m, O.some(record as any)).find(
                (t) => t.event.type === type
              );

              const { newLinks, ...event } = suggestion.event;
              const { data: e } = await apiProvider.create(`/events`, {
                data: {
                  ...event,
                  links: newLinks,
                },
              });
              return navigate(`/events/${e.id}`);
            });
        }}
      />
    </Box>
  );
};

export const LinkEdit: React.FC = () => {
  const record = useRecordContext();
  return (
    <Edit
      redirect={false}
      title={<EditTitle />}
      actions={
        <Toolbar>
          <UpdateMetadataButton />
        </Toolbar>
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
          <ReferenceField source="image.id" reference="media">
            <TextField source="location" />
          </ReferenceField>
          <MediaField source="image.location" type="image/jpeg" />
          <TextInput source="description" fullWidth />
          <DateInput source="publishDate" />
          <ReferenceGroupInput source="provider" />
        </FormTab>
        <FormTab label="Events">
          <CreateEventButton />
          <ReferenceArrayEventInput
            source="newEvents"
            reference="events"
            defaultValue={[]}
          />
          <ReferenceManyField
            reference="events"
            target="links[]"
            filter={{ withDrafts: true }}
          >
            <Datagrid rowClick="edit">
              <BooleanField source="draft" />
              <FunctionField
                render={(r: any) => {
                  switch (r.type) {
                    case io.http.Events.Death.DEATH.value:
                      return `${r.type}: ${r.payload.victim}`;
                    default:
                      return `${r.type}: ${r.payload.title}`;
                  }
                }}
              />
            </Datagrid>
          </ReferenceManyField>
        </FormTab>
        <FormTab label="Event Suggestions">
          <ReferenceManyField
            reference="events/suggestions"
            filter={{ links: record?.id ? [record.id] : [] }}
            target="links[]"
          >
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <TextField source="payload.event.payload.title" />
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
