import { ActorDataGrid } from "@liexp/ui/lib/components/admin/actors/ActorDataGrid.js";
import { List, TextInput } from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const actorFilters = [
  <TextInput key="search" label="fullName" source="q" alwaysOn size="small" />,
];

const ActorList: React.FC = () => (
  <List
    resource="actors"
    filters={actorFilters}
    perPage={50}
    sort={{ field: "createdAt", order: "DESC" }}
  >
    <ActorDataGrid />
  </List>
);

export default ActorList;
