import * as http from '@liexp/shared/io/http';
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import { FormControl, Grid } from "@mui/material";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit, FormTab,
  List,
  ListProps,
  RaRecord,
  ReferenceField,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField, useRecordContext
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import ReferenceActorInput from "./Common/ReferenceActorInput";
import ReferenceArrayEventInput from "./Common/ReferenceArrayEventInput";
import ReferenceGroupInput from "./Common/ReferenceGroupInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";

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

const EditTitle: React.FC<{ record?: http.GroupMember.GroupMember }> = ({ record }) => {
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
          <ReferenceManyField
            reference="events"
            source="id"
            target="groupsMembers[]"
          >
            <Datagrid>
              <ReferenceField source="id" reference="events">
                <TextField source="id" />
              </ReferenceField>
              <DateField source="date" />
              <DateField source="createdAt" />
            </Datagrid>
          </ReferenceManyField>
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
