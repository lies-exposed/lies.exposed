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
  DateInput, EditProps,
  FormTab,
  List,
  ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  UrlField,
  useRecordContext
} from "react-admin";
import { EditEventForm } from '../../components/Common/EditEventForm';
import { MediaArrayInput } from "../../components/Common/MediaArrayInput";
import ReferenceActorInput from "../../components/Common/ReferenceActorInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import { ReferenceMediaDataGrid } from "../../components/Common/ReferenceMediaDataGrid";
import URLMetadataInput from "../../components/Common/URLMetadataInput";
import { WebPreviewButton } from "../../components/Common/WebPreviewButton";
import EventPreview from '../../components/previews/EventPreview';
import { transformEvent } from "../../utils";
import { EventEditActions } from "./actions/EditEventActions";

const patentEventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <ReferenceActorInput key="victim" source="victim" alwaysOn />,
  <DateInput key="date" source="date" />,
];

export const PatentList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={patentEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      widthDrafts: false,
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

export const PatentEventTitle: React.FC = () => {
  const record = useRecordContext();
  return record ? (
    <span>{`Event: ${record.payload.title} on ${record.date}`}</span>
  ) : null;
};

export const PatentEventEditFormTab: React.FC<
  EditProps & { sourcePrefix?: string }
> = ({ sourcePrefix, ...props }) => {
  const source = (s: string): string =>
    `${typeof sourcePrefix === "undefined" ? "" : `${sourcePrefix}.`}${s}`;

  return (
    <FormTab {...(props as any)} label="Payload">
      <ReferenceActorInput source={source("payload.victim")} />
    </FormTab>
  );
};

export const PatentEdit: React.FC = () => {
  return (
    <EditEventForm
      title={<PatentEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(r.id, r)}
      preview={<EventPreview />}
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
          <ReferenceArrayKeywordInput
            source="keywords"
            defaultValue={[]}
            showAdd
          />
          <ReactPageInput source="excerpt" onlyText />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput source="body" />
        </FormTab>
        <FormTab label="Media">
          <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceArrayLinkInput source="links" />
        </FormTab>
      </TabbedForm>
    </EditEventForm>
  );
};

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
      <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} showAdd />
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
