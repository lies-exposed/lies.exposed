import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ReferenceActorInput from "@liexp/ui/components/admin/common/ReferenceActorInput";
import ReferenceArrayActorInput from "@liexp/ui/components/admin/common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "@liexp/ui/components/admin/common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/components/admin/common/ReferenceArrayLinkInput";
import URLMetadataInput from "@liexp/ui/components/admin/common/URLMetadataInput";
import { MediaArrayInput } from "@liexp/ui/components/admin/media/MediaArrayInput";
import { ReferenceMediaDataGrid } from "@liexp/ui/components/admin/media/ReferenceMediaDataGrid";
import EventPreview from "@liexp/ui/components/admin/previews/EventPreview";
import { EventGeneralTab } from "@liexp/ui/components/admin/tabs/EventGeneralTab";
import { PatentEventEditFormTab } from '@liexp/ui/components/admin/tabs/PatentEventEditTab';
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  DateInput, FormTab,
  List,
  type ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  UrlField,
  useDataProvider,
  useRecordContext
} from "react-admin";
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

export const PatentEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<PatentEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            <PatentEventEditFormTab />
          </EventGeneralTab>
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
    </EditForm>
  );
};

export const PatentCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider()
  return (
  <Create
    title="Create a Patent Event"
    {...props}
    transform={(data) => transformEvent(dataProvider)(uuid(), data)}
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
);}
