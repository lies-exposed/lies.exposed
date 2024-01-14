import type * as http from "@liexp/shared/lib/io/http/index.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import { WebPreviewButton } from "@liexp/ui/lib/components/admin/common/WebPreviewButton.js";
import ReferenceArrayEventInput from "@liexp/ui/lib/components/admin/events/ReferenceArrayEventInput.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import {
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormTab,
  List,
  SimpleForm,
  TabbedForm,
  useRecordContext,
  type CreateProps,
  type ListProps,
  type RaRecord,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { FormControl, Grid } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";

const transformGroupMember = ({
  endDate,
  ...r
}: RaRecord): RaRecord | Promise<RaRecord> => {
  return {
    ...r,
    group: r.group.id,
    actor: r.actor.id,
    endDate: endDate === "" ? undefined : endDate,
  };
};

export const GroupMemberList: React.FC<ListProps> = (props) => (
  <List {...props} resource="groups-members">
    <Datagrid rowClick="edit">
      <AvatarField
        label="resources.groups.fields.avatar"
        source="group.avatar"
      />
      <AvatarField
        label="resources.actors.fields.avatar"
        source="actor.avatar"
      />
      <DateField source="startDate" />
      <DateField source="endDate" emptyText="Still going" />
      <DateField source="updatedAt" showTime={true} />
      <DateField source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<{ record?: http.GroupMember.GroupMember }> = ({
  record,
}) => {
  return <span>Actor {record?.actor.fullName}</span>;
};

export const GroupMemberEdit: React.FC = () => {
  const record = useRecordContext<http.GroupMember.GroupMember>();
  return (
    <Edit
      title={<EditTitle record={record} />}
      transform={transformGroupMember}
    >
      <TabbedForm>
        <FormTab label="generals">
          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid item md={4}>
                <ReferenceActorInput source="actor.id" />
              </Grid>
              <Grid item md={4}>
                <WebPreviewButton resource="actors" source="actor.id" />
              </Grid>
            </Grid>
          </FormControl>
          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid item md={4}>
                <ReferenceGroupInput source="group.id" />
              </Grid>
              <Grid item md={4}>
                <WebPreviewButton resource="groups" source="group.id" />
              </Grid>
            </Grid>
          </FormControl>

          <DateInput source="startDate" required={true} />
          <DateInput source="endDate" required={false} />
          <ReactPageInput label="excerpt" source="excerpt" onlyText={true} />
        </FormTab>
        <FormTab label="Body">
          <ReactPageInput label="body" source="body" />
        </FormTab>
        <FormTab label="Events">
          <ReferenceArrayEventInput source="events" />
          <ReferenceManyEventField target="groupsMembers[]" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const GroupMemberCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create a Group Member"
    transform={transformGroupMember}
  >
    <SimpleForm>
      <ReferenceActorInput source="actor.id" />
      <ReferenceGroupInput source="group.id" />
      <DateInput source="startDate" />
      <DateInput source="endDate" />
      <ReactPageInput source="body" />
    </SimpleForm>
  </Create>
);
