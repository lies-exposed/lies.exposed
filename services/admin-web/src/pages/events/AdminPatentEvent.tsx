import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { Box } from '@liexp/ui/components/mui';
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput, FormTab,
  List,
  ListProps,
  SimpleForm,
  TabbedForm,
  TextField,
  TextInput,
  UrlField,
  useRecordContext
} from "react-admin";
import { EditFormWithPreview } from "../../components/Common/EditEventForm";
import { MediaArrayInput } from "../../components/Common/MediaArrayInput";
import ReferenceActorInput from "../../components/Common/ReferenceActorInput";
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../../components/Common/ReferenceArrayLinkInput";
import { ReferenceMediaDataGrid } from "../../components/Common/ReferenceMediaDataGrid";
import URLMetadataInput from "../../components/Common/URLMetadataInput";
import EventPreview from "../../components/previews/EventPreview";
import { EventGeneralTab } from "../../components/tabs/EventGeneralTab";
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

export const PatentEventEditFormTab: React.FC = () => {
  return (
    <Box>
      <TextInput source="payload.title" fullWidth />
      <URLMetadataInput type="Link" source="payload.source" />
      <ReferenceArrayActorInput
        source="payload.owners.actors"
        defaultValue={[]}
      />
      <ReferenceArrayGroupInput
        source="payload.owners.groups"
        defaultValue={[]}
      />
    </Box>
  );
};

export const PatentEdit: React.FC = () => {
  return (
    <EditFormWithPreview
      title={<PatentEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(r.id, r)}
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
    </EditFormWithPreview>
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
