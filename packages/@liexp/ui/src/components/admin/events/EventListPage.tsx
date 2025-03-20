import {
  DEATH,
  SCIENTIFIC_STUDY,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import * as R from "fp-ts/lib/Record.js";
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
import { EventIcon } from "../../Common/Icons/EventIcon.js";
import { Box, Icons, Typography } from "../../mui/index.js";
import ReferenceArrayActorInput from "../actors/ReferenceArrayActorInput.js";
import ReferenceArrayGroupMemberInput from "../common/ReferenceArrayGroupMemberInput.js";
import ReferenceArrayGroupInput from "../groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";

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
    choices={io.http.Events.EventType.members.map((t) => ({
      id: t.Type,
      name: t.Type,
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

export const EventDataGrid: React.FC = () => {
  return (
    <Datagrid
      rowClick={(_props, _id, record) => {
        if (record.type === SCIENTIFIC_STUDY.Type) {
          return `/scientific-studies/${record.id}`;
        }
        if (record.type === DEATH.Type) {
          return `/deaths/${record.id}`;
        }
        return `/events/${record.id}`;
      }}
    >
      <BooleanField source="draft" />
      <FunctionField
        label="type"
        render={(r) => {
          return (
            <Box>
              <EventIcon color="primary" type={r.type} />{" "}
              {[
                io.http.Events.EventTypes.UNCATEGORIZED.Type,
                io.http.Events.EventTypes.SCIENTIFIC_STUDY.Type,
                io.http.Events.EventTypes.BOOK.Type,
              ].includes(r.type) ? (
                <Typography>{r.payload.title}</Typography>
              ) : null}
              {r.type === io.http.Events.EventTypes.DEATH.Type && (
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
        render={(r) => {
          return !R.isEmpty(r.excerpt)
            ? getTextContentsCapped(r.excerpt, 60)
            : "";
        }}
      />
      <FunctionField source="links" render={(r) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r) => r.media?.length ?? 0} />
      <FunctionField<RaRecord<string>>
        label="actors"
        source="payload"
        render={(r) => {
          if (r?.type === Events.EventTypes.UNCATEGORIZED.Type) {
            return r.payload.actors.length;
          }

          if (r?.type === Events.EventTypes.SCIENTIFIC_STUDY.Type) {
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
        render={(r) => (r?.location?.coordinates ? <Icons.PinDrop /> : "-")}
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
  );
};

export const EventListPage: React.FC = () => {
  return (
    <List
      resource={RESOURCE}
      filterDefaultValues={{
        withDeleted: true,
        draft: undefined,
      }}
      filters={eventsFilter}
      perPage={25}
    >
      <EventDataGrid />
    </List>
  );
};
