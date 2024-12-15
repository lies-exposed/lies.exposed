import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import { ReferenceArrayBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceArrayBySubjectField.js";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectField.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import {
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  List,
  TextField,
  TextInput,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const booksFilter = [
  <TextInput key="search" source="q" label="title" alwaysOn />,
  <ReferenceArrayActorInput key="actors" source="actors" alwaysOn />,
  <ReferenceArrayGroupInput key="groups" source="groups" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" alwaysOn />,
];

const BookList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={booksFilter}
    perPage={25}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      draft: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <TextField source="payload.title" />
      <ReferenceArrayBySubjectField source="payload.authors" />
      <ReferenceBySubjectField source="payload.publisher" />
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default BookList;
