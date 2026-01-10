import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  List,
  ReferenceField,
  TextField,
  TextInput,
  UrlField,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const patentEventsFilter = [
  <TextInput key="search" label="Search" source="q" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" />,
];

const PatentList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={patentEventsFilter}
    perPage={50}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      draft: false,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="payload.title" />
      <ReferenceField source="payload.source" reference="links">
        <UrlField source="title" />
      </ReferenceField>

      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default PatentList;
