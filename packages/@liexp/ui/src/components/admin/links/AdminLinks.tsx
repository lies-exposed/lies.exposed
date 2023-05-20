import * as io from "@liexp/shared/lib/io";
import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  // AutocompleteArrayInput,
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
  type ListProps,
  LoadingPage,
  type RaRecord,
  // ReferenceArrayInput,
  ReferenceField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useGetIdentity,
  usePermissions,
  useRecordContext,
  useRefresh,
  type DatagridProps,
  // AutocompleteInput,
} from "react-admin";
import { Box, Grid, Toolbar } from "../../mui";
import { DangerZoneField } from "../common/DangerZoneField";
import { EditForm } from "../common/EditForm";
import URLMetadataInput from "../common/URLMetadataInput";
import { CreateEventFromLinkButton } from "../events/CreateEventFromLinkButton";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput";
import ReferenceGroupInput from "../groups/ReferenceGroupInput";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput";
import { SearchLinksButton } from "../links/SearchLinksButton";
import { MediaField } from "../media/MediaField";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput";
import LinkPreview from "../previews/LinkPreview";
import ReferenceUserInput from "../user/ReferenceUserInput";

const RESOURCE = "links";

const linksFilter = [
  <TextInput key="search" label="Search" source="q" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  // <ReferenceArrayInput key="events" source="events" reference="events" alwaysOn>
  //   <AutocompleteInput optionText="payload.title" size="small" />
  // </ReferenceArrayInput>,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn />,
  <BooleanInput key="onlyDeleted" source="onlyDeleted" alwaysOn />,
];

export const LinkListActions: React.FC = () => {
  return (
    <Box display="flex" flexDirection="row">
      <CreateButton />
      <SearchLinksButton />
    </Box>
  );
};

export const LinkDatagrid: React.FC<DatagridProps> = (props) => {
  const { permissions, isLoading } = usePermissions();

  if (isLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  return (
    <Datagrid rowClick="edit" {...props}>
      <FunctionField
        render={(r: any) => {
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
      {isAdmin && (
        <ReferenceField source="creator" reference="users">
          <FunctionField
            render={(u: any) => `${u.firstName} ${u.lastName} (${u.username})`}
          />
        </ReferenceField>
      )}
      <ReferenceField source="provider" reference="groups">
        <TextField source="name" />
      </ReferenceField>

      <FunctionField
        label="resources.links.fields.events_length"
        render={(r: any | undefined) => (r?.events?.length ?? "-")}
      />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  );
};

export const LinkList: React.FC<ListProps> = (props) => {
  const { data, isLoading } = useGetIdentity();
  const { permissions, isLoading: isPermsLoading } = usePermissions();

  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  const filter = !isAdmin && data?.id ? { creator: data?.id } : {};

  return (
    <List
      resource={RESOURCE}
      filters={linksFilter}
      perPage={20}
      filter={filter}
      filterDefaultValues={{
        _sort: "createdAt",
        _order: "DESC",
      }}
      actions={<LinkListActions />}
      {...props}
    >
      <LinkDatagrid />
    </List>
  );
};

const transformLink = ({ newEvents, ...r }: RaRecord): RaRecord => {
  return {
    ...r,
    image: r.image.id ? r.image.id : undefined,
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
  const dataProvider = useDataProvider();
  return (
    <Button
      label="resources.links.actions.override_thumbnail"
      variant="contained"
      onClick={() => {
        void dataProvider
          .put(
            `/links/${record?.id}`,
            transformLink({
              ...record,
              overrideThumbnail: true,
            })
          )
          .then(() => {
            refresh();
          });
      }}
    />
  );
};

const UpdateMetadataButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  return (
    <Button
      label="resources.links.actions.update_metadata"
      variant="contained"
      onClick={() => {
        void dataProvider.put(`/links/${record?.id}/metadata`).then(() => {
          refresh();
        });
      }}
    />
  );
};

export const LinkEdit: React.FC = () => {
  const record = useRecordContext();
  const { permissions, isLoading: isLoadingPermissions } = usePermissions();
  if (isLoadingPermissions) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);

  return (
    <EditForm
      redirect={false}
      title={<EditTitle />}
      actions={
        <Toolbar>
          <UpdateMetadataButton />
        </Toolbar>
      }
      preview={<LinkPreview record={record} />}
      transform={transformLink}
    >
      <TabbedForm>
        <FormTab label="General">
          <Grid container spacing={2}>
            <Grid item md={6}>
              <TextInput source="title" fullWidth />
              <URLMetadataInput source="url" type="Link" />
              <DateInput source="publishDate" />
              <MediaField source="image.thumbnail" sourceType="image/jpeg" />
              <ReferenceMediaInput
                source="image.id"
                allowedTypes={ImageType.types.map((t) => t.value)}
              />
              <OverrideThumbnail />
              <TextInput source="description" fullWidth multiline />
              <ReferenceGroupInput source="provider" />
              {isAdmin && <DangerZoneField />}
            </Grid>
            <Grid item md={6}>
              <ReferenceArrayKeywordInput source="keywords" showAdd={false} />
              {isAdmin && <ReferenceUserInput source="creator" />}
            </Grid>
          </Grid>
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
                  if (r) {
                    switch (r.type) {
                      case io.http.Events.Death.DEATH.value:
                        return `${r.type}: ${r.payload.victim}`;
                      default:
                        return `${r.type}: ${r.payload.title}`;
                    }
                  }
                  return "no record";
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
        <TextInput source="description" />
        <ReferenceArrayEventInput
          source="events"
          reference="events"
          defaultValue={[]}
        />
      </SimpleForm>
    </Create>
  );
};
