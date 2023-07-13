import * as io from "@liexp/shared/lib/io";
import { Events } from "@liexp/shared/lib/io/http";
import { DEATH } from "@liexp/shared/lib/io/http/Events/Death";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import { getTextContentsCapped } from "@liexp/shared/lib/slate";
import PinDropIcon from "@mui/icons-material/PinDrop";
import * as R from "fp-ts/Record";
import * as React from "react";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  FunctionField,
  List,
  ReferenceField,
  SelectInput,
  TextField,
  TextInput,
  type RaRecord,
} from "react-admin";
import { EventIcon } from "../../Common/Icons/EventIcon";
import { Box, Typography } from "../../mui";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput";
import ReferenceArrayGroupMemberInput from "../common/ReferenceArrayGroupMemberInput";
import ReferenceArrayGroupInput from "../groups/ReferenceArrayGroupInput";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput";

const RESOURCE = "events";

const eventsFilter = [
  <TextInput key="title" source="title" alwaysOn size="small" />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
  <SelectInput
    key="type[]"
    source="type"
    alwaysOn
    size="small"
    choices={io.http.Events.EventType.types.map((t) => ({
      id: t.value,
      name: t.value,
    }))}
  />,
  <ReferenceArrayKeywordInput
    key="keywords"
    source="keywords"
    showAdd={false}
    alwaysOn
  />,
  <ReferenceArrayGroupInput key="groups" source="groups" />,
  <ReferenceArrayActorInput key="actors" source="actors" />,
  <ReferenceArrayGroupMemberInput key="groupsMembers" source="groupsMembers" />,
  <DateInput key="startDate" source="startDate" />,
  <DateInput key="endDate" source="endDate" />,
];

export const EventListPage: React.FC = () => {
  return (
    <List
      resource={RESOURCE}
      filterDefaultValues={{
        withDeleted: true,
        draft: undefined,
      }}
      filters={eventsFilter}
      perPage={20}
    >
      <Datagrid
        rowClick={(_props, _id, record) => {
          if (record.type === SCIENTIFIC_STUDY.value) {
            return `/scientific-studies/${record.id}`;
          }
          if (record.type === DEATH.value) {
            return `/deaths/${record.id}`;
          }
          return `/events/${record.id}`;
        }}
      >
        <BooleanField source="draft" />
        <FunctionField
          label="type"
          render={(r: any) => {
            return (
              <Box>
                <EventIcon color="primary" type={r.type} />
                <Typography display="inline" variant="subtitle1">
                  {r.type}
                </Typography>{" "}
                {[
                  io.http.Events.Uncategorized.UNCATEGORIZED.value,
                  io.http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
                ].includes(r.type) ? (
                  <Typography>{r.payload.title}</Typography>
                ) : (
                  <ReferenceField source="payload.victim" reference="actors">
                    <TextField source="username" />
                  </ReferenceField>
                )}
              </Box>
            );
          }}
        />
        <FunctionField
          label="excerpt"
          render={(r: any) => {
            return !R.isEmpty(r.excerpt)
              ? getTextContentsCapped(r.excerpt, 60)
              : "";
          }}
        />
        <FunctionField
          source="links"
          render={(r: any) => r.links?.length ?? 0}
        />
        <FunctionField
          source="media"
          render={(r: any) => r.media?.length ?? 0}
        />
        <FunctionField<RaRecord<string>>
          label="actors"
          source="payload"
          render={(r) => {
            if (r?.type === Events.Uncategorized.UNCATEGORIZED.value) {
              return r.payload.actors.length;
            }

            if (r?.type === Events.ScientificStudy.SCIENTIFIC_STUDY.value) {
              return r.payload.authors.length;
            }

            return 1;
          }}
        />

        <FunctionField<RaRecord<string>>
          label="groups"
          source="payload"
          render={(r) => {
            if (r?.type === "Uncategorized") {
              return r.payload.groups.length;
            }

            if (r?.type === "ScientificStudy") {
              return r.payload.publisher ? 1 : 0;
            }

            return 0;
          }}
        />
        <FunctionField<RaRecord<string>>
          label="groupsMembers"
          source="payload"
          render={(r) => {
            if (r?.type === "Uncategorized") {
              return r.payload.groupsMembers.length;
            }

            if (r?.type === "ScientificStudy") {
              return 0;
            }

            return 1;
          }}
        />
        <FunctionField<RaRecord<string>>
          label="Location"
          source="payload.location.coordinates"
          render={(r) => (r?.location?.coordinates ? <PinDropIcon /> : "-")}
        />

        <DateField source="date" />
        <FunctionField<RaRecord<string>>
          label="Dates"
          render={(r) => {
            return (
              <Box>
                <DateField source="updatedAt" />
                <DateField source="createdAt" />
                <DateField source="deletedAt" />
              </Box>
            );
          }}
        />
      </Datagrid>
    </List>
  );
};
