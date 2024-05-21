import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import {
  BooleanInput,
  Create,
  CreateButton,
  DateInput,
  List,
  LoadingPage,
  SimpleForm,
  TextInput,
  useGetIdentity,
  usePermissions,
  type ListProps,
} from "react-admin";
import { Box } from "../../mui/index.js";
import URLMetadataInput from "../common/URLMetadataInput.js";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput.js";
import ReferenceGroupInput from "../groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "../links/SearchLinksButton.js";
import { LinkDataGrid } from "./LinkDataGrid.js";

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
      perPage={25}
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
