import { Events } from "@liexp/shared/io/http";
import { uuid } from "@liexp/shared/utils/uuid";
import { EventIcon } from "@liexp/ui/components/Common/Icons/EventIcon";
import { MapInput, MapInputType } from "@liexp/ui/components/admin/MapInput";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import PinDropIcon from "@mui/icons-material/PinDrop";
import { Box, Grid } from "@mui/material";
import * as React from "react";
import {
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
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
  useRecordContext
} from "react-admin";
import { AvatarField } from "../../components/Common/AvatarField";
import ExcerptField from "../../components/Common/ExcerptField";
import ReferenceAreaInput from '../../components/Common/ReferenceAreaInput';
import ReferenceArrayActorInput from "../../components/Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../../components/Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "../../components/Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "../../components/Common/ReferenceArrayKeywordInput";
import { ReferenceLinkTab } from "../../components/tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "../../components/tabs/ReferenceMediaTab";
import { transformEvent } from "../../utils";

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

export const UncategorizedEventEditTab: React.FC<
  EditProps & { record?: RaRecord; sourcePrefix?: string }
> = ({ sourcePrefix, ...props }) => {
  const source = (s: string): string =>
    `${typeof sourcePrefix === "undefined" ? "" : `${sourcePrefix}.`}${s}`;
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <TextInput source={source("payload.title")} fullWidth />
        </Grid>
        <Grid item md={12}>
          <Grid container>
            <Grid item md={6}>
              <Box>
                <TextInput
                  source={source("type")}
                  defaultValue={Events.Uncategorized.UNCATEGORIZED.value}
                  hidden={true}
                />

                <DateInput source={source("payload.endDate")} />
              </Box>
            </Grid>
            <Grid item md={6}>
              <ReferenceAreaInput source="payload.location" />
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={4} sm={12}>
          <ReferenceArrayActorInput source={source("payload.actors")} />
          <ReferenceArrayField
            source={source("payload.actors")}
            reference="actors"
          >
            <Datagrid rowClick="edit">
              <AvatarField source="avatar" />
              <TextField source="fullName" />
            </Datagrid>
          </ReferenceArrayField>
        </Grid>
        <Grid item md={4} sm={12}>
          <ReferenceArrayGroupMemberInput
            source={source("payload.groupsMembers")}
          />
          <ReferenceArrayField
            source={source("payload.groupsMembers")}
            reference="groups-members"
          >
            <Datagrid rowClick="edit">
              <AvatarField source="actor.avatar" />
              <AvatarField source="group.avatar" />
            </Datagrid>
          </ReferenceArrayField>
        </Grid>
        <Grid item md={4} sm={12}>
          <ReferenceArrayGroupInput source={source("payload.groups")} />
          <ReferenceArrayField
            reference="groups"
            source={source("payload.groups")}
          >
            <Datagrid rowClick="edit">
              <TextField source="name" />
              <AvatarField source="avatar" fullWidth={false} />
            </Datagrid>
          </ReferenceArrayField>
        </Grid>
      </Grid>
    </Box>
  );
};

export const UncategorizedEventCreate: React.FC = (props) => {
  return (
    <Create
      title="Create a Event"
      transform={(data) => transformEvent(uuid(), data)}
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
          <MapInput source="payload.location" type={MapInputType.POINT} />
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
