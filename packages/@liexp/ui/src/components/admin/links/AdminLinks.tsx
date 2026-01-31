import { Link } from "@liexp/io/lib/http/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as React from "react";
import { Box, Card, CardContent, Icons } from "../../mui/index.js";
import URLMetadataInput from "../common/URLMetadataInput.js";
import ReferenceArrayEventInput from "../events/ReferenceArrayEventInput.js";
import ReferenceGroupInput from "../groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "../links/SearchLinksButton.js";
import {
  BulkDeleteButton,
  Create,
  CreateButton,
  DateInput,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  List,
  LoadingPage,
  NumberInput,
  SavedQueriesList,
  SimpleForm,
  TextInput,
  useGetIdentity,
  usePermissions,
  type ListProps,
} from "../react-admin.js";
import { CreateEventFromLinksButton } from "./CreateEventFromLinksButton.js";
import { LinkDataGrid } from "./LinkDataGrid.js";

const RESOURCE = "links";

const linksFilter = [
  <ReferenceGroupInput key="provider" source="provider" alwaysOn />,
  <NumberInput
    key="eventsCount"
    label="Min Events"
    source="eventsCount"
    size="small"
    alwaysOn
  />,
];

const LinkListAside: React.FC = () => {
  return (
    <Card
      sx={{
        order: -1,
        mr: 2,
        mt: 0,
        width: 300,
        display: "flex",
        flex: "1 0 auto",
        // Hide filter sidebar on mobile to maximize content space
        "@media (max-width: 960px)": {
          display: "none",
        },
      }}
    >
      <CardContent>
        <SavedQueriesList />
        <FilterLiveSearch label="Search" source="q" />
        <FilterList label="Events" icon={<Icons.PlayCircleOutline />}>
          <FilterListItem label="No Events" value={{ emptyEvents: true }} />
        </FilterList>
        <FilterList label="Status" icon={<Icons.Assignment />}>
          <FilterListItem
            label="Draft"
            value={{ status: [Link.DRAFT.literals[0]] }}
          />
          <FilterListItem
            label="Approved"
            value={{ status: [Link.APPROVED.literals[0]] }}
          />
          <FilterListItem label="Deleted" value={{ onlyDeleted: true }} />
          <FilterListItem label="Unshared" value={{ onlyUnshared: true }} />
          <FilterListItem
            label="No Publish Date"
            value={{ noPublishDate: true }}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
};

export const LinkListActions: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      gap={{ xs: 1, sm: 0 }}
      width={{ xs: "100%", sm: "auto" }}
    >
      <CreateButton />
      <SearchLinksButton />
    </Box>
  );
};

const LinkBulkActionButtons: React.FC = () => (
  <Box
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    gap={1}
    width={{ xs: "100%", sm: "auto" }}
  >
    <CreateEventFromLinksButton />
    <BulkDeleteButton />
  </Box>
);

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
      {...props}
      resource={RESOURCE}
      filters={linksFilter}
      perPage={50}
      filterDefaultValues={{
        ...filter,
        _sort: "createdAt",
        _order: "DESC",
      }}
      actions={<LinkListActions />}
      aside={<LinkListAside />}
      sx={{
        "& .RaList-content": {
          "@media (max-width: 960px)": {
            width: "100%",
          },
        },
      }}
    >
      <LinkDataGrid bulkActionButtons={<LinkBulkActionButtons />} />
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
        <ReferenceArrayEventInput source="events" defaultValue={[]} />
      </SimpleForm>
    </Create>
  );
};
