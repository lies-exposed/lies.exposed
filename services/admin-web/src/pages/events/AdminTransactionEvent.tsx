import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceAreaInput from "@liexp/ui/lib/components/admin/areas/input/ReferenceAreaInput.js";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectField.js";
import ReferenceBySubjectInput from "@liexp/ui/lib/components/admin/common/inputs/BySubject/ReferenceBySubjectInput.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput.js";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  List,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  type CreateProps,
  type EditProps,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const transactionEventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <DateInput key="date" source="date" />,
];

export const TransactionList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={transactionEventsFilter}
    perPage={25}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="payload.title" />
      <ReferenceBySubjectField source="payload.from" />
      <NumberField source="payload.total" />
      <ReferenceBySubjectField source="payload.to" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const TransactionEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <EditEventForm {...props}>
      {() => (
        <Box>
          <BooleanInput source="draft" defaultValue={false} />
          <TextInput fullWidth source="payload.title" />
          <ReferenceAreaInput source="payload.location" />
          <NumberInput source="payload.total" />
          <SelectInput
            source="payload.currency"
            choices={["euro", "dollar"].map((c) => ({
              id: c,
              name: c,
            }))}
          />
          <DateInput source="date" />
          <ReferenceBySubjectInput source="payload.from" />
          <ReferenceBySubjectInput source="payload.to" />
          <BlockNoteInput source="excerpt" onlyText />
          <ReferenceArrayKeywordInput
            source="keywords"
            defaultValue={[]}
            showAdd
          />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </Box>
      )}
    </EditEventForm>
  );
};

export const TransactionCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Transaction"
      {...props}
      transform={(data: any) => transformEvent(dataProvider)(uuid(), data)}
    >
      <SimpleForm>
        <BooleanInput source="draft" defaultValue={false} />
        <TextInput fullWidth source="payload.title" />
        <NumberInput source="payload.total" />
        <SelectInput
          source="payload.currency"
          choices={["euro", "dollar"].map((c) => ({
            id: c,
            name: c,
          }))}
        />
        <DateInput source="date" />
        <ReferenceBySubjectInput source="payload.from" />
        <ReferenceBySubjectInput source="payload.to" />

        <BlockNoteInput source="excerpt" onlyText />
        <BlockNoteInput source="body" />

        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      </SimpleForm>
    </Create>
  );
};
