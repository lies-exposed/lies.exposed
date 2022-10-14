import * as io from "@liexp/shared/io";
import { CreateEventFromLinkButton } from '@liexp/ui/components/admin/common/CreateEventFromLinkButton';
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import { MediaField } from "@liexp/ui/components/admin/common/MediaField";
import ReferenceArrayEventInput from "@liexp/ui/components/admin/common/ReferenceArrayEventInput";
import ReferenceGroupInput from "@liexp/ui/components/admin/common/ReferenceGroupInput";
import { SearchLinksButton } from "@liexp/ui/components/admin/common/SearchLinksButton";
import URLMetadataInput from "@liexp/ui/components/admin/common/URLMetadataInput";
import LinkPreview from "@liexp/ui/components/admin/previews/LinkPreview";
import { Box, Toolbar } from "@liexp/ui/components/mui";
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
  FormTab,
  FunctionField,
  List,
  RaRecord,
  ReferenceArrayInput,
  ReferenceField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useRecordContext,
  useRefresh
} from "react-admin";
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

const transformLink = ({ newEvents, ...r }: RaRecord): RaRecord => {
  return {
    ...r,
    provider: r.provider === "" ? undefined : r.provider,
    events: (r.events ?? []).concat(newEvents ?? []),
  };
};

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Link {record?.title}</span>;
};

const OverrideThumbnail: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();

  return (
    <Button
      label="resources.links.actions.override_thumbnail"
      variant="contained"
      onClick={() => {
        void apiProvider
          .put(
            `/links/${record?.id}`,
            transformLink({
              ...record,
              overrideThumbnail: true,
            })
          )
          .then(() => refresh());
      }}
    />
  );
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



export const LinkEdit: React.FC = () => {
  const record = useRecordContext();
  return (
    <EditForm
      redirect={false}
      title={<EditTitle />}
      actions={
        <Toolbar>
          <UpdateMetadataButton />
        </Toolbar>
      }
      preview={<LinkPreview />}
      transform={transformLink}
    >
      <TabbedForm>
        <FormTab label="General">
          <TextInput source="title" fullWidth />
          <URLMetadataInput source="url" type="Link" />
          <DateInput source="publishDate" />
          <ReferenceField source="image.id" reference="media">
            <TextField source="location" />
          </ReferenceField>
          <MediaField source="image.location" type="image/jpeg" />
          <OverrideThumbnail />
          <TextInput source="description" fullWidth multiline />
          <ReferenceGroupInput source="provider" />
        </FormTab>
        <FormTab label="Events">
          <CreateEventFromLinkButton />
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
    </EditForm>
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
