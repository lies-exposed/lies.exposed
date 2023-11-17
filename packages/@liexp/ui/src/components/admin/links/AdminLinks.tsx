import { ImageType } from "@liexp/shared/lib/io/http/Media";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils";
import * as React from "react";
import {
  BooleanInput,
  Button,
  Create,
  CreateButton,
  Datagrid,
  DateInput,
  FormTab,
  List,
  LoadingPage,
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
  type ListProps,
  type RaRecord,
} from "react-admin";
import { Box, Grid, Toolbar } from "../../mui";
import { SocialPostFormTabContent } from '../SocialPost/SocialPostFormTabContent';
import { DangerZoneField } from "../common/DangerZoneField";
import { EditForm } from "../common/EditForm";
import URLMetadataInput from "../common/URLMetadataInput";
import { CreateEventFromLinkButton } from "../events/CreateEventFromLinkButton";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput";
import ReferenceManyEventField from "../events/ReferenceManyEventField";
import ReferenceGroupInput from "../groups/ReferenceGroupInput";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput";
import { SearchLinksButton } from "../links/SearchLinksButton";
import { MediaField } from "../media/MediaField";
import ReferenceMediaInput from "../media/input/ReferenceMediaInput";
import LinkPreview from "../previews/LinkPreview";
import ReferenceUserInput from "../user/ReferenceUserInput";
import { LinkDataGrid } from './LinkDataGrid';
import { LinkTGPostButton } from "./button/LinkTGPostButton";

const RESOURCE = "links";

const linksFilter = [
  <TextInput key="search" label="Search" source="q" alwaysOn />,
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  // <ReferenceArrayInput key="events" source="events" reference="events" alwaysOn>
  //   <AutocompleteInput optionText="payload.title" size="small" />
  // </ReferenceArrayInput>,
  <BooleanInput key="emptyEvents" source="emptyEvents" alwaysOn />,
  <BooleanInput key="onlyDeleted" source="onlyDeleted" alwaysOn />,
  <BooleanInput key="onlyUnshared" source="onlyUnshared" alwaysOn />,
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
      <LinkDataGrid />
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
            }),
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
          <LinkTGPostButton />
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
              <MediaField
                source="image.thumbnail"
                sourceType="image/jpeg"
                controls={false}
              />
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
              <ReferenceArrayKeywordInput source="keywords" showAdd={true} />
              {isAdmin && <ReferenceUserInput source="creator" />}
            </Grid>
          </Grid>
        </FormTab>
        <FormTab label="Events">
          <CreateEventFromLinkButton />
          <ReferenceArrayEventInput source="newEvents" defaultValue={[]} />
          <ReferenceManyEventField
            target="links[]"
            filter={{ withDrafts: true }}
          />
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
        <FormTab label="Social Posts">
          <SocialPostFormTabContent type='links' source="id" />
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
