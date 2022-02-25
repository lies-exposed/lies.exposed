import { Patent } from "@liexp/shared/io/http/Events";
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
  Filter,
  FormTab,
  List,
  ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  UrlField
} from "react-admin";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceActorInput from "../Common/ReferenceActorInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import URLMetadataInput from "../Common/URLMetadataInput";
import { WebPreviewButton } from "../Common/WebPreviewButton";
import { transformEvent } from "./utils";

const PatentEventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="type" value="Death" />
      <ReferenceActorInput source="victim" alwaysOn />
      <DateInput source="date" />
    </Filter>
  );
};

export const PatentList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={<PatentEventsFilter />}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <TextField source="payload.title" />
      <UrlField source="payload.source" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const PatentEventTitle: React.FC<{ record: Patent.Patent }> = ({
  record,
}) => {
  return (
    <span>
      Event: {record.payload.title} on {record.date}
    </span>
  );
};

export const PatentEventEditFormTab: React.FC<EditProps> = (
  props: EditProps
) => (
  <FormTab label="Payload" {...props}>
    <ReferenceActorInput source="payload.victim" />
  </FormTab>
);

export const PatentEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<PatentEventTitle {...(props as any)} />}
    {...props}
    transform={(r) => transformEvent(r.id as any, r)}
  >
    <TabbedForm>
      <FormTab label="Generals">
        <WebPreviewButton resource="/dashboard/events" source="id" />
        <TextInput source="payload.title" />
        <URLMetadataInput type="Link" source="payload.source" />
        <DateInput source="date" />
        <ReferenceArrayActorInput
          source="payload.owners.actors"
          defaultValue={[]}
        />
        <ReferenceArrayGroupInput
          source="payload.owners.groups"
          defaultValue={[]}
        />
        <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
        <ReactPageInput source="excerpt" onlyText />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <ReactPageInput source="body" />
      </FormTab>
      <FormTab label="Media">
        <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" />
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const PatentCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Patent Event"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
  >
    <SimpleForm>
      <TextInput source="payload.title" />
      <DateInput source="date" />
      <URLMetadataInput type="Link" source="payload.source" />
      <BooleanInput source="draft" defaultValue={false} />
      <ReactPageInput source="excerpt" onlyText />
      <ReactPageInput source="body" />
      <ReferenceArrayActorInput
        source="payload.owners.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.owners.groups"
        defaultValue={[]}
      />
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      <MediaArrayInput
        label="media"
        source="newMedia"
        fullWidth={true}
        defaultValue={[]}
      />
    </SimpleForm>
  </Create>
);
