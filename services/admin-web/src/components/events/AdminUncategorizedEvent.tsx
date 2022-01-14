import { Events } from "@econnessione/shared/io/http";
import { Uncategorized } from "@econnessione/shared/io/http/Events";
import { uuid } from "@econnessione/shared/utils/uuid";
import {
  MapInput,
  MapInputType,
} from "@econnessione/ui/components/admin/MapInput";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
import Editor from "@econnessione/ui/components/Common/Editor";
import { EventIcon } from "@econnessione/ui/components/Common/Icons/EventIcon";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as React from "react";
import {
  BooleanInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
  Filter,
  FormTab,
  FunctionField,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceArrayInput,
  required,
  SelectArrayInput,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "../Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import { transformEvent } from "./utils";

const RESOURCE = "events";

const EventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="title" alwaysOn size="small" />
      <ReferenceArrayGroupInput source="groups" alwaysOn />
      <ReferenceArrayActorInput source="actors" alwaysOn />
      <ReferenceArrayGroupMemberInput source="groupsMembers" />
      <DateInput source="startDate" />
      <DateInput source="endDate" />
    </Filter>
  );
};

export const UncategorizedEventList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
    }}
    filters={<EventsFilter />}
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        label="type"
        render={(r: any) => {
          return <EventIcon color="primary" type={r.type} />;
        }}
      />
      <FunctionField
        label="excerpt"
        render={(r: any) => <Editor readOnly value={r.excerpt} />}
      />
      <FunctionField
        label="actors"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.actors.length;
          }

          return 0;
        }}
      />

      <FunctionField
        source="payload.groups"
        render={(r: Record | undefined) =>
          r ? (r.payload.groups ?? []).length : 0
        }
      />
      {/*
      <FunctionField
        source="payload.groupsMembers"
        render={(r: Record | undefined) => (r ? r.payload.groupsMembers.length : 0)}
      /> */}
      <FunctionField
        label="Location"
        source="payload.location"
        render={(r: Record | undefined) =>
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

export const UncategorizedEventTitle: React.FC<{
  record: Uncategorized.Uncategorized;
}> = ({ record }: any) => {
  return <span>Event: {record.payload.title}</span>;
};

export const UncategorizedEventEditTab: React.FC<EditProps> = (
  props: EditProps
) => {
  return (
    <FormTab label="Payload" {...props}>
      <TextInput
        source="type"
        defaultValue={Events.Uncategorized.UncategorizedType.value}
        hidden={true}
      />
      <TextInput source="payload.title" />
      <DateInput source="payload.endDate" />
      <MapInput
        source="payload.location"
        type={MapInputType.POINT}
        defaultValue={undefined}
      />
      <ReferenceArrayActorInput source="payload.actors" />
      <ReferenceArrayField source="payload.actors" reference="actors">
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="fullName" />
          <AvatarField source="avatar" />
        </Datagrid>
      </ReferenceArrayField>
      <ReferenceArrayGroupMemberInput source="payload.groupsMembers" />
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

      <ReferenceArrayGroupInput source="payload.groups" />
      <ReferenceArrayField reference="groups" source="payload.groups">
        <Datagrid rowClick="edit">
          <TextField source="name" />
          <AvatarField source="avatar" fullWidth={false} />
        </Datagrid>
      </ReferenceArrayField>
    </FormTab>
  );
};

export const UncategorizedEventCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Event"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
  >
    <TabbedForm>
      <FormTab label="General">
        <BooleanInput source="draft" defaultValue={false} />
        <TextInput
          source="type"
          defaultValue={Events.Uncategorized.UncategorizedType.value}
          hidden={true}
        />
        <TextInput source="payload.title" validation={[required()]} />
        <MapInput source="payload.location" type={MapInputType.POINT} />
        <DateInput
          source="date"
          validation={[required()]}
          defaultValue={new Date()}
        />
        <DateInput source="payload.endDate" />
        <ReactPageInput source="excerpt" onlyText />
        <ReferenceArrayKeywordInput source="keywords" defaultValue={[]} />
      </FormTab>
      <FormTab label="body">
        <ReactPageInput source="body" />
        <ReferenceArrayActorInput source="payload.actors" defaultValue={[]} />
        <ReferenceArrayField source="payload.actors" reference="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
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
        <ReferenceArrayLinkInput source="links" defaultValue={[]} />
      </FormTab>
      <FormTab label="Media">
        <MediaArrayInput source="newMedia" defaultValue={[]} />
      </FormTab>
    </TabbedForm>
  </Create>
);
