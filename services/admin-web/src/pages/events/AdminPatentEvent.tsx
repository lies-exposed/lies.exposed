import { uuid } from "@liexp/shared/lib/utils/uuid";
import {
  BooleanField,
  BooleanInput,
  Create,
  type CreateProps,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  List,
  type ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  UrlField,
  useDataProvider,
  useRecordContext,
  ReferenceField,
} from "@liexp/ui/lib/components/admin";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/lib/components/admin/links/ReferenceArrayLinkInput";
import ReferenceLinkInput from '@liexp/ui/lib/components/admin/links/ReferenceLinkInput';
import { ReferenceMediaDataGrid } from "@liexp/ui/lib/components/admin/media/ReferenceMediaDataGrid";
import { MediaArrayInput } from "@liexp/ui/lib/components/admin/media/input/MediaArrayInput";
import EventPreview from "@liexp/ui/lib/components/admin/previews/EventPreview";
import { EventGeneralTab } from "@liexp/ui/lib/components/admin/tabs/EventGeneralTab";
import { PatentEventEditFormTab } from "@liexp/ui/lib/components/admin/tabs/PatentEventEditTab";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils";
import * as React from "react";
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
      <ReferenceField source="payload.source" reference='links'>
        <UrlField source="title" />
      </ReferenceField>

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
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Patent Event"
      {...props}
      transform={(data) => transformEvent(dataProvider)(uuid(), data)}
    >
      <SimpleForm>
        <TextInput source="payload.title" />
        <DateInput source="date" />
        <ReferenceLinkInput source="payload.source" />
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
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
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
};
