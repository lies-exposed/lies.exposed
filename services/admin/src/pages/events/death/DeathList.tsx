import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  List,
  ReferenceField,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const deathEventsFilter = [
  <ReferenceArrayActorInput
    key="victim"
    label="Victim"
    source="victim"
    alwaysOn
  />,
  <BooleanInput
    key="withDrafts"
    label="Draft ?"
    source="draft"
    size="small"
    alwaysOn
  />,
  <DateInput key="date" source="date" size="small" />,
];

const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={deathEventsFilter}
    perPage={25}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
      draft: true,
      victim: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <ReferenceField source="payload.victim" reference="actors">
        <AvatarField source="avatar.thumbnail" />
      </ReferenceField>
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default DeathList;
