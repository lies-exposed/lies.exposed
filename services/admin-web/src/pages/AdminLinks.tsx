import * as io from "@liexp/shared/io";
import { getSuggestions } from "@liexp/ui/helpers/event.helper";
import { Box, MenuItem, Select, Toolbar } from "@mui/material";
import * as O from "fp-ts/lib/Option";
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
  ReferenceField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  useRefresh,
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
  const refresh = useRefresh();
  const [type, setType] = React.useState(
    io.http.Events.EventType.types[1].value
  );

  if (record?.events?.legnth > 0) {
    return null;
  }
  return (
    <Box>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setType(e.target.value as any);
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
            .then((m) => {
              const suggestion = getSuggestions(m, O.some(record as any)).find(
                (t) => t.event.type === type
              );

              const { newLinks, ...event } = suggestion.event;
              return apiProvider
                .create(`/events`, {
                  data: {
                    ...event,
                    links: newLinks,
                  },
                })
                .then(() => refresh());
            });
        }}
      />
    </Box>
  );
};

export const LinkEdit: React.FC = () => {
  return (
    <Edit
      redirect={false}
      title={<EditTitle />}
      actions={
        <Toolbar>
          <UpdateMetadataButton />
          <CreateEventButton />
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
