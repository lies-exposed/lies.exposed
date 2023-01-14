import * as io from "@liexp/shared/io";
import { ImageType } from "@liexp/shared/io/http/Media";
import { checkIsAdmin } from "@liexp/shared/utils/user.utils";
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
  ListProps,
  LoadingPage,
  RaRecord,
  ReferenceArrayInput,
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
} from "react-admin";
import { Box, Toolbar } from "../mui";
import { CreateEventFromLinkButton } from "./common/CreateEventFromLinkButton";
import { EditForm } from "./common/EditForm";
import ReferenceArrayEventInput from "./common/ReferenceArrayEventInput";
import ReferenceGroupInput from "./common/ReferenceGroupInput";
import ReferenceUserInput from "./common/ReferenceUserInput";
import { SearchLinksButton } from "./common/SearchLinksButton";
import URLMetadataInput from "./common/URLMetadataInput";
import { MediaField } from "./media/MediaField";
import ReferenceMediaInput from "./media/ReferenceMediaInput";
import LinkPreview from "./previews/LinkPreview";

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
    <Box display="flex" flexDirection="row">
      <CreateButton />
      <SearchLinksButton />
    </Box>
  );
};

export const LinkList: React.FC<ListProps> = (props) => {
  const { identity, isLoading } = useGetIdentity();
  const { permissions, isLoading: isPermsLoading } = usePermissions();

  if (isLoading || isPermsLoading) {
    return <LoadingPage />;
  }

  const isAdmin = checkIsAdmin(permissions);
  const filter = !isAdmin && identity?.id ? { creator: identity?.id } : {};

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
      <Datagrid rowClick="edit">
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
            <TextField source="firstName" />
          </ReferenceField>
        )}
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
      preview={<LinkPreview />}
      transform={transformLink}
    >
      <TabbedForm>
        <FormTab label="General">
          <TextInput source="title" fullWidth />
          <URLMetadataInput source="url" type="Link" />
          {isAdmin && <ReferenceUserInput source="creator" />}

          <DateInput source="publishDate" />
          <MediaField source="image.thumbnail" sourceType="image/jpeg" />
          <ReferenceMediaInput
            source="image.id"
            allowedTypes={ImageType.types.map((t) => t.value)}
          />

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
