import type * as Events from "@liexp/shared/lib/io/http/Events";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput";
import ReferenceAreaInput from "@liexp/ui/lib/components/admin/common/ReferenceAreaInput";
import { ReferenceBySubjectField } from "@liexp/ui/lib/components/admin/common/ReferenceBySubjectField";
import ReferenceBySubjectInput from "@liexp/ui/lib/components/admin/common/ReferenceBySubjectInput";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput";
import {
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  List,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useDataProvider,
  type CreateProps,
  type EditProps,
  type FormTabProps,
  type ListProps
} from "@liexp/ui/lib/components/admin/react-admin";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import { Box } from '@liexp/ui/lib/components/mui';
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
    perPage={20}
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

export const TransactionTitle: React.FC<{
  record: Events.Transaction.Transaction;
}> = ({ record }) => {
  return <span>Transaction: {record?.payload?.total}</span>;
};

export const TransactionEditFormTab: React.FC<FormTabProps> = (props) => (
  <FormTab {...props} label="Payload">
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const TransactionEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
    <EditEventForm title={<TransactionTitle {...(props as any)} />} {...props}>
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
        <ReactPageInput source="excerpt" onlyText />
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </Box>
    </EditEventForm>
  );
};

export const TransactionCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Transaction"
      {...props}
      transform={(data) => transformEvent(dataProvider)(uuid(), data)}
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

        <ReactPageInput source="excerpt" onlyText />
        <ReactPageInput source="body" />

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
