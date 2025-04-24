import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import * as React from "react";
import {
  Datagrid,
  DateInput,
  ReferenceArrayField,
  TextField,
  TextInput,
  type RaRecord,
} from "react-admin";
import { Box, Grid } from "../../../mui/index.js";
import ReferenceArrayActorInput from "../../actors/ReferenceArrayActorInput.js";
import ReferenceAreaInput from "../../areas/input/ReferenceAreaInput.js";
import { AvatarField } from "../../common/AvatarField.js";
import ReferenceArrayGroupMemberInput from "../../common/ReferenceArrayGroupMemberInput.js";
import ReferenceArrayGroupInput from "../../groups/ReferenceArrayGroupInput.js";
import {
  SuggestedActorEntityRelationsBox,
  SuggestedGroupEntityRelationsBox,
} from "../../links/SuggestedEntityRelationsBox.js";
import { type EventGeneralTabChildrenHandlers } from "../../tabs/EventGeneralTab.js";

export const UncategorizedEventEditTab: React.FC<{
  record?: RaRecord;
  sourcePrefix?: string;
  suggestions?: ExtractEntitiesWithNLPOutput | null;
  handlers?: EventGeneralTabChildrenHandlers;
}> = ({ sourcePrefix, suggestions, record, handlers, ...props }) => {
  const source = (s: string): string =>
    `${typeof sourcePrefix === "undefined" ? "" : `${sourcePrefix}.`}${s}`;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ md: 12 }}>
          <TextInput size="small" source={source("payload.title")} fullWidth />
        </Grid>
        <Grid size={{ md: 12 }}>
          <Grid container>
            <Grid size={{ md: 6 }}>
              <Box>
                <DateInput size="small" source={source("payload.endDate")} />
              </Box>
            </Grid>
            <Grid size={{ md: 6 }}>
              <ReferenceAreaInput size="small" source="payload.location" />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ md: 4, sm: 12 }}>
          <ReferenceArrayActorInput source={source("payload.actors")} />
          <ReferenceArrayField
            source={source("payload.actors")}
            reference="actors"
          >
            <Datagrid rowClick="edit">
              <AvatarField source="avatar.thumbnail" />
              <TextField source="fullName" />
            </Datagrid>
          </ReferenceArrayField>
          <SuggestedActorEntityRelationsBox
            actors={suggestions?.entities.actors ?? []}
            excludeActors={record?.payload?.actors}
            onClick={handlers?.onActorClick}
          />
        </Grid>
        <Grid size={{ md: 4, sm: 12 }}>
          <ReferenceArrayGroupMemberInput
            source={source("payload.groupsMembers")}
          />
          <ReferenceArrayField
            source={source("payload.groupsMembers")}
            reference="groups-members"
          >
            <Datagrid rowClick="edit">
              <AvatarField source="actor.avatar.thumbnail" />
              <AvatarField source="group.avatar.thumbnail" />
            </Datagrid>
          </ReferenceArrayField>
        </Grid>
        <Grid size={{ md: 4, sm: 12 }}>
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
          <SuggestedGroupEntityRelationsBox
            groups={suggestions?.entities.groups ?? []}
            excludeGroups={record?.payload?.groups}
            onClick={handlers?.onGroupClick}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
