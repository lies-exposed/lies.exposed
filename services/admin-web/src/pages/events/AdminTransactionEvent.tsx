import type * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import ReferenceActorInput from "@liexp/ui/components/admin/actors/ReferenceActorInput";
import ReferenceAreaInput from "@liexp/ui/components/admin/common/ReferenceAreaInput";
import { ReferenceBySubjectField } from "@liexp/ui/components/admin/common/ReferenceBySubjectField";
import ReferenceBySubjectInput from "@liexp/ui/components/admin/common/ReferenceBySubjectInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/components/admin/links/ReferenceArrayLinkInput";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  type EditProps,
  FormTab,
  type FormTabProps,
  List,
  type ListProps,
  NumberField,
  NumberInput,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
} from "react-admin";
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
  return <span>Transaction: {record?.payload?.total}</span>;
};

export const TransactionEditFormTab: React.FC<FormTabProps> = (props) => (
  <FormTab {...props} label="Payload">
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const TransactionEdit: React.FC<EditProps> = (props: EditProps) => {
  const dataProvider = useDataProvider();
  return (
    <Edit
      title={<TransactionTitle {...(props as any)} />}
      {...props}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
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
