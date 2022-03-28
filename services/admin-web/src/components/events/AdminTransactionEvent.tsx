import * as Events from "@liexp/shared/io/http/Events";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import {
  MapInput,
  MapInputType
} from "@liexp/ui/src/components/admin/MapInput";
import * as React from "react";
import {
  BooleanInput,
  BooleanField,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormTab,
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
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import { ReferenceBySubjectField } from "../Common/ReferenceBySubjectField";
import ReferenceBySubjectInput from "../Common/ReferenceBySubjectInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const TransactionEventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <BooleanInput label="Draft only" source="withDrafts" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const TransactionList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<TransactionEventsFilter />}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false
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

export const TransactionEditFormTab: React.FC<EditProps> = (
  props: EditProps
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const TransactionEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<TransactionTitle {...(props as any)} />}
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <WebPreviewButton resource="/events" source="id" />
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
        <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="payload.location" type={MapInputType.POINT} />
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

      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
    </SimpleForm>
  </Create>
);
