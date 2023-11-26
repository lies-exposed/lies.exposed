import * as React from "react";
import {
  Datagrid,
  DateInput,
  ReferenceArrayField,
  TextField,
  TextInput,
  type EditProps,
  type RaRecord,
} from "react-admin";
import { Box, Grid } from "../../../mui";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput";
import ReferenceAreaInput from "../../areas/input/ReferenceAreaInput";
import { AvatarField } from "../../common/AvatarField";
import ReferenceArrayGroupMemberInput from "../../common/ReferenceArrayGroupMemberInput";
import ReferenceArrayGroupInput from "../../groups/ReferenceArrayGroupInput";

export const UncategorizedEventEditTab: React.FC<
  EditProps & { record?: RaRecord; sourcePrefix?: string }
> = ({ sourcePrefix, ...props }) => {
  const source = (s: string): string =>
    `${typeof sourcePrefix === "undefined" ? "" : `${sourcePrefix}.`}${s}`;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item md={12}>
          <TextInput size="small" source={source("payload.title")} fullWidth />
        </Grid>
        <Grid item md={12}>
          <Grid container>
            <Grid item md={6}>
              <Box>
                <DateInput size="small" source={source("payload.endDate")} />
              </Box>
            </Grid>
            <Grid item md={6}>
              <ReferenceAreaInput size="small" source="payload.location" />
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
