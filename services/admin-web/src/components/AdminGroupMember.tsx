import { FormControl, Grid } from "@material-ui/core";
import * as React from "react";
import {
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  FormTab,
  List,
  ListProps,
  Record,
  ReferenceField,
  ReferenceInput,
  ReferenceManyField,
  SimpleForm,
  TabbedForm,
  TextField,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import MarkdownInput from "./Common/MarkdownInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";

const transformGroupMember = ({
  endDate,
  ...r
}: Record): Record | Promise<Record> => {
  return {
    ...r,
    endDate: endDate === "" ? undefined : endDate,
  };
};

const transformGroupMember = ({
  endDate,
  ...r
}: Record): Record | Promise<Record> => {
  return {
    ...r,
    endDate: endDate === "" ? undefined : endDate,
  };
};

export const GroupMemberList: React.FC<ListProps> = (props) => (
  <List {...props} resource="groups-members">
    <Datagrid rowClick="edit">
      <AvatarField source="group.avatar" />
      <AvatarField source="actor.avatar" />
      <DateField label="Started At" source="startDate" />
      <DateField label="Ended At" source="endDate" emptyText="Still going" />
      <TextField source="body" />
      <DateField label="Updated At" source="updatedAt" showTime={true} />
      <DateField label="Created At" source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>;
};

export const GroupMemberEdit: React.FC<EditProps> = (props) => {
  return (
    <Edit
      title={<EditTitle {...props} />}
      {...props}
      transform={transformGroupMember}
    >
      <TabbedForm>
        <FormTab label="generals">
          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid item md={4}>
                <ReferenceInput
                  reference="actors"
                  source="actor.id"
                  filterToQuery={(fullName) => ({ fullName })}
                >
                  <AutocompleteInput optionText="fullName" />
                </ReferenceInput>
              </Grid>
              <Grid item md={4}>
                <WebPreviewButton resource="actors" source="actor.id" />
              </Grid>
            </Grid>
          </FormControl>
          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid item md={4}>
                <ReferenceInput
                  reference="groups"
                  source="group.id"
                  filterToQuery={(name) => ({ name })}
                >
                  <AutocompleteInput source="id" optionText="name" />
                </ReferenceInput>
              </Grid>
              <Grid item md={4}>
                <WebPreviewButton resource="groups" source="group.id" />
              </Grid>
            </Grid>
          </FormControl>

          <DateInput source="startDate" required={true} />
          <DateInput source="endDate" required={false} />
          <MarkdownInput source="body" />
        </FormTab>
        <FormTab label="Events">
          <ReferenceManyField reference="events" target="groupsMembers[]">
            <Datagrid>
              <ReferenceField source="id" reference="events">
                <TextField source="title" />
              </ReferenceField>
              <DateField source="startDate" />
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
      <ReferenceInput reference="actors" source="actor">
        <AutocompleteInput source="id" optionText="fullName" />
      </ReferenceInput>
      <ReferenceInput reference="groups" source="group">
        <AutocompleteInput source="id" />
      </ReferenceInput>
      <DateInput source="startDate" />
      <DateInput source="endDate" />
      <MarkdownInput source="body" />
    </SimpleForm>
  </Create>
);
