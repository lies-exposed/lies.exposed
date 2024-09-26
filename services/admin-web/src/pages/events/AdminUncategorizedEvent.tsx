import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { EventIcon } from "@liexp/ui/lib/components/Common/Icons/EventIcon.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ReferenceAreaInput from "@liexp/ui/lib/components/admin/areas/input/ReferenceAreaInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import ReferenceArrayGroupMemberInput from "@liexp/ui/lib/components/admin/common/ReferenceArrayGroupMemberInput.js";
import { UncategorizedEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/UncategorizedEventEditTab.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  FunctionField,
  List,
  ReferenceArrayField,
  TabbedForm,
  TextField,
  TextInput,
  required,
  type ListProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { ReferenceLinkTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceLinkTab.js";
import { ReferenceMediaTab } from "@liexp/ui/lib/components/admin/tabs/ReferenceMediaTab.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import PinDropIcon from "@mui/icons-material/PinDrop.js";
import * as React from "react";

const RESOURCE = "events";

const eventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <TextInput key="search" label="title" source="q" alwaysOn size="small" />,
  <ReferenceArrayGroupInput key="groups" source="groups" alwaysOn />,
  <ReferenceArrayActorInput key="actors" source="actors" alwaysOn />,
  <ReferenceArrayGroupMemberInput key="groupsMembers" source="groupsMembers" />,
  <DateInput key="startDate" source="startDate" />,
  <DateInput key="endDate" source="endDate" />,
];

export const UncategorizedEventList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
      withDrafts: false,
    }}
    filters={eventsFilter}
    perPage={25}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        label="type"
        render={(r) => {
          return <EventIcon color="primary" type={r.type} />;
        }}
      />
      <ExcerptField source="excerpt" />
      <FunctionField
        label="actors"
        source="payload"
        render={(r) => {
          if (r?.type === "Uncategorized") {
            return r.payload.actors.length;
          }

          return 0;
        }}
      />

      <FunctionField
        source="payload.groups"
        render={(r) => (r ? (r.payload.groups ?? []).length : 0)}
      />
      <FunctionField
        label="Location"
        source="payload.location"
        render={(r) => (r?.location?.coordinates ? <PinDropIcon /> : "-")}
      />
      <FunctionField source="links" render={(r) => r.links?.length ?? 0} />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const UncategorizedEventCreate: React.FC = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Event"
      transform={(data: any) => transformEvent(dataProvider)(uuid(), data)}
    >
      <TabbedForm>
        <FormTab label="General">
          <BooleanInput source="draft" defaultValue={false} />
          <UncategorizedEventEditTab />
          <TextInput
            source="type"
            defaultValue={Events.EventTypes.UNCATEGORIZED.value}
            hidden={true}
          />
          <TextInput source="payload.title" validate={[required()]} />
          <ReferenceAreaInput source="payload.location" />
          <DateInput
            source="date"
            validate={[required()]}
            defaultValue={new Date()}
          />
          <DateInput source="payload.endDate" />
          <BlockNoteInput source="excerpt" onlyText />
          <ReferenceArrayKeywordInput
            showAdd
            source="keywords"
            defaultValue={[]}
          />
        </FormTab>
        <FormTab label="body">
          <BlockNoteInput source="body" />
          <ReferenceArrayActorInput source="payload.actors" defaultValue={[]} />
          <ReferenceArrayField source="payload.actors" reference="actors">
            <Datagrid rowClick="edit">
              <TextField source="fullName" />
              <AvatarField source="avatar.thumbnail" />
            </Datagrid>
          </ReferenceArrayField>
          <ReferenceArrayGroupMemberInput
            source="payload.groupsMembers"
            defaultValue={[]}
          />
          <ReferenceArrayField
            source="payload.groupsMembers"
            reference="groups-members"
          >
            <Datagrid rowClick="edit">
              <AvatarField source="actor.avatar.thumbnail" />
              <AvatarField source="group.avatar.thumbnail" />
              <DateField source="startDate" />
              <DateField source="endDate" />
            </Datagrid>
          </ReferenceArrayField>

          <ReferenceArrayGroupInput source="payload.groups" defaultValue={[]} />
          <ReferenceArrayField reference="groups" source="payload.groups">
            <Datagrid rowClick="edit">
              <TextField source="name" />
              <AvatarField source="avatar.thumbnail" />
            </Datagrid>
          </ReferenceArrayField>
        </FormTab>

        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
        <FormTab label="Media">
          <ReferenceMediaTab source="media" />
        </FormTab>
      </TabbedForm>
    </Create>
  );
};
