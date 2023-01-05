import { http } from "@liexp/shared/io";
import { uuid } from "@liexp/shared/utils/uuid";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import { EditForm } from "@liexp/ui/components/admin/common/EditForm";
import ExcerptField from "@liexp/ui/components/admin/common/ExcerptField";
import ReferenceArrayActorInput from "@liexp/ui/components/admin/common/ReferenceArrayActorInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "@liexp/ui/components/admin/common/ReferenceArrayLinkInput";
import { ImportMediaButton } from "@liexp/ui/components/admin/media/ImportMediaButton";
import { MediaArrayInput } from "@liexp/ui/components/admin/media/MediaArrayInput";
import { ReferenceMediaDataGrid } from "@liexp/ui/components/admin/media/ReferenceMediaDataGrid";
import EventPreview from "@liexp/ui/components/admin/previews/EventPreview";
import { DeathEventEditFormTab } from "@liexp/ui/components/admin/tabs/DeathEventEditFormTab";
import { EventGeneralTab } from "@liexp/ui/components/admin/tabs/EventGeneralTab";
import { ReferenceLinkTab } from "@liexp/ui/components/admin/tabs/ReferenceLinkTab";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import * as React from "react";
import {
  AutocompleteInput,
  BooleanField,
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  List,
  ListProps,
  ReferenceField,
  ReferenceInput,
  SimpleForm,
  TabbedForm,
  useDataProvider,
  useRecordContext,
} from "react-admin";
import { EventEditActions } from "./actions/EditEventActions";

const deathEventsFilter = [
  <ReferenceArrayActorInput
    key="victim"
    label="Victim"
    source="victim"
    size="small"
    alwaysOn
  />,
  <BooleanInput
    key="withDrafts"
    label="Draft ?"
    source="draft"
    size="small"
    alwaysOn
  />,
  <DateInput key="date" source="date" size="small" />,
];

export const DeathList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    filters={deathEventsFilter}
    perPage={20}
    filterDefaultValues={{
      _sort: "date",
      _order: "DESC",
      withDrafts: false,
      draft: true,
      victim: undefined,
    }}
  >
    <Datagrid rowClick="edit">
      <BooleanField source="draft" />
      <ReferenceField source="payload.victim" reference="actors">
        <AvatarField source="avatar" />
      </ReferenceField>
      <ExcerptField source="excerpt" />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const DeathEventTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Death.Death>();
  return (
    <span>
      Event: {record?.payload?.victim} on {record?.date.toString()}
    </span>
  );
};

export const DeathEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      title={<DeathEventTitle />}
      actions={<EventEditActions />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      preview={<EventPreview />}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            <DeathEventEditFormTab />
          </EventGeneralTab>
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput source="body" />
        </FormTab>
        <FormTab label="Media">
          <ImportMediaButton />
          <MediaArrayInput source="newMedia" defaultValue={[]} fullWidth />
          <ReferenceMediaDataGrid source="media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};

export const DeathCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Death Event"
      {...props}
      transform={(data) => transformEvent(dataProvider)(uuid(), data)}
    >
      <SimpleForm>
        <BooleanInput source="draft" defaultValue={false} />
        <ReactPageInput source="excerpt" onlyText />
        <ReactPageInput source="body" />
        <ReferenceInput
          source="payload.victim"
          reference="actors"
          filterToQuery={(fullName) => ({ fullName })}
        >
          <AutocompleteInput source="id" optionText="fullName" />
        </ReferenceInput>
        <DateInput source="date" />
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
