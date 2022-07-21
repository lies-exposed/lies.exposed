import * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  FormTabProps,
  List,
  ListProps,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput
} from "react-admin";
import ReferenceActorInput from "../../components/Common/ReferenceActorInput";
import ReferenceAreaInput from "../../components/Common/ReferenceAreaInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import { ReferenceBySubjectField } from "../../components/Common/ReferenceBySubjectField";
import ReferenceBySubjectInput from "../../components/Common/ReferenceBySubjectInput";
import { transformEvent } from "../../utils";
import { EventEditActions } from "./actions/EditEventActions";

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
  return <span>Transaction: {record.payload.total}</span>;
};

export const TransactionEditFormTab: React.FC<FormTabProps> = (props) => (
  <FormTab {...props} label="Payload">
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const TransactionEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<TransactionTitle {...(props as any)} />}
    {...props}
    actions={<EventEditActions />}
    transform={(r) => transformEvent(r.id, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
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
      </FormTab>
      <FormTab label="Body">
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const TransactionCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Transaction"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
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

      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} showAdd />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
