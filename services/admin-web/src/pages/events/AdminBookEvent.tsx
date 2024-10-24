import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import { ReferenceArrayBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceArrayBySubjectField.js";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectField.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  SimpleForm,
  TextField,
  TextInput,
  type CreateProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const booksFilter = [
  <TextInput key="search" source="q" label="title" alwaysOn />,
  <ReferenceArrayActorInput key="actors" source="actors" alwaysOn />,
  <ReferenceArrayGroupInput key="groups" source="groups" alwaysOn />,
  <BooleanInput key="draft" label="Draft only" source="draft" alwaysOn />,
  <DateInput key="date" source="date" alwaysOn />,
];

export const BookList: React.FC<ListProps> = (props) => (
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

export const BookEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditEventForm
      transform={(data: any) => transformEvent(dataProvider)(data.id, data)}
    >
      {(props) => <BookEditFormTab />}
    </EditEventForm>
  );
};

export const BookCreate: React.FC<CreateProps> = () => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Add a book"
      transform={(data: any) => {
        return transformEvent(dataProvider)(uuid(), data).then((record) => ({
          ...record,
          payload: {
            ...record.payload,
            publisher: record.payload.publisher?.type
              ? record.payload.publisher
              : undefined,
          },
        }));
      }}
    >
      <SimpleForm>
        <BookEditFormTab />
        <Grid container spacing={2}>
          <Grid item md={6}>
            <BooleanInput source="draft" defaultValue={false} />
            <BookEditFormTab />
            <DateInput source="date" />
          </Grid>
          <Grid item md={6}>
            <ReferenceArrayKeywordInput
              source="keywords"
              defaultValue={[]}
              showAdd
            />
          </Grid>
          <Grid item md={12}>
            <BlockNoteInput source="excerpt" onlyText />
            <BlockNoteInput source="body" onlyText />
            <ReferenceArrayLinkInput source="links" defaultValue={[]} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};
