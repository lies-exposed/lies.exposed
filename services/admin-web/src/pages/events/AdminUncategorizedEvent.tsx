import { Events } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { AvatarField } from "@liexp/ui/components/admin/common/AvatarField";
import ExcerptField from "@liexp/ui/components/admin/common/ExcerptField";
import ReferenceAreaInput from "@liexp/ui/components/admin/common/ReferenceAreaInput";
import ReferenceArrayActorInput from "@liexp/ui/components/admin/common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "@liexp/ui/components/admin/common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "@liexp/ui/components/admin/common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "@liexp/ui/components/admin/common/ReferenceArrayKeywordInput";
import { ReferenceLinkTab } from "@liexp/ui/components/admin/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "@liexp/ui/components/admin/tabs/ReferenceMediaTab";
import { UncategorizedEventEditTab } from "@liexp/ui/components/admin/tabs/UncategorizedEventEditTab";
import { transformEvent } from "@liexp/ui/components/admin/transform.utils";
import PinDropIcon from "@mui/icons-material/PinDrop";
import * as React from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  FormTab,
  FunctionField,
  List,
  ListProps,
  RaRecord,
  ReferenceArrayField,
  required,
  TabbedForm,
  TextField,
  TextInput,
  useDataProvider,
  useRecordContext,
} from "react-admin";

const RESOURCE = "events";

const eventsFilter = [
  <BooleanInput
    key="withDrafts"
    label="Draft only"
    source="withDrafts"
    alwaysOn
  />,
  <TextInput key="title" source="title" alwaysOn size="small" />,
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
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        label="type"
        render={(r: any) => {
          return <EventIcon color="primary" type={r.type} />;
        }}
      />
      <ExcerptField source="excerpt" />
      <FunctionField
        label="actors"
        source="payload"
        render={(r: RaRecord | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.actors.length;
          }

          return 0;
        }}
      />

      <FunctionField
        source="payload.groups"
        render={(r: RaRecord | undefined) =>
          r ? (r.payload.groups ?? []).length : 0
        }
      />
      <FunctionField
        label="Location"
        source="payload.location"
        render={(r: RaRecord | undefined) =>
          r?.location?.coordinates ? <PinDropIcon /> : "-"
        }
      />
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const UncategorizedEventTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Event: {record?.payload?.title}</span>;
};

export const UncategorizedEventCreate: React.FC = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      title="Create a Event"
      transform={(data) => transformEvent(dataProvider)(uuid(), data)}
    >
      <TabbedForm>
        <FormTab label="General">
          <BooleanInput source="draft" defaultValue={false} />
          <UncategorizedEventEditTab />
          <TextInput
            source="type"
            defaultValue={Events.Uncategorized.UNCATEGORIZED.value}
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
          <ReactPageInput source="excerpt" onlyText />
          <ReferenceArrayKeywordInput
            showAdd
            source="keywords"
            defaultValue={[]}
          />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput source="body" />
          <ReferenceArrayActorInput source="payload.actors" defaultValue={[]} />
          <ReferenceArrayField source="payload.actors" reference="actors">
            <Datagrid rowClick="edit">
              <TextField source="fullName" />
              <AvatarField source="avatar" />
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
              <AvatarField source="actor.avatar" />
              <AvatarField source="group.avatar" />
              <DateField source="startDate" />
              <DateField source="endDate" />
            </Datagrid>
          </ReferenceArrayField>

          <ReferenceArrayGroupInput source="payload.groups" defaultValue={[]} />
          <ReferenceArrayField reference="groups" source="payload.groups">
            <Datagrid rowClick="edit">
              <TextField source="name" />
              <AvatarField source="avatar" fullWidth={false} />
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
