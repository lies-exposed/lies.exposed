import {
  DEATH,
  EVENT_TYPES,
  SCIENTIFIC_STUDY,
} from "@liexp/io/lib/http/Events/EventType.js";
import * as io from "@liexp/io/lib/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import { Schema } from "effect";
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
import { useTheme } from "../../../theme/index.js";
import { EventIcon } from "../../Common/Icons/EventIcon.js";
import {
  Box,
  Card,
  CardContent,
  Icons,
  Typography,
  useMuiMediaQuery,
} from "../../mui/index.js";
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
      id: t.literals[0],
      name: t.literals[0],
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

const EventListAside: React.FC = () => {
  return (
    <Card
      sx={{
        order: -1,
        mr: 2,
        mt: 0,
        width: 300,
        display: "flex",
        flex: "1 0 auto",
        // Hide filter sidebar on mobile to maximize content space
        "@media (max-width: 960px)": {
          display: "none",
        },
      }}
    >
      <CardContent>
        <Typography variant="h6">Filters</Typography>
      </CardContent>
    </Card>
  );
};

export const EventDataGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Datagrid
      rowClick={(_props, _id, record) => {
        if (Schema.is(SCIENTIFIC_STUDY)(record.type)) {
          return `/scientific-studies/${record.id}`;
        }
        if (Schema.is(DEATH)(record.type)) {
          return `/deaths/${record.id}`;
        }
        return `/events/${record.id}`;
      }}
      sx={{
        "@media (max-width: 600px)": {
          "& .MuiDataGrid-cell": {
            padding: "8px 4px",
            minHeight: "80px",
            whiteSpace: "normal",
            wordBreak: "break-word",
          },
          "& .MuiDataGrid-columnHeader": {
            fontSize: "0.7rem",
            padding: "8px 4px",
          },
        },
        "@media (min-width: 601px) and (max-width: 960px)": {
          "& .MuiDataGrid-cell": {
            padding: "8px 12px",
            minHeight: "80px",
          },
          "& .MuiDataGrid-columnHeader": {
            padding: "12px 8px",
          },
        },
      }}
    >
      <BooleanField
        source="draft"
        sx={{ display: { xs: "none", sm: "table-cell" } }}
      />
      <FunctionField
        label="type"
        render={(r) => {
          return (
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: { xs: 1, sm: 2 },
                minWidth: 0,
              }}
            >
              <EventIcon color="primary" type={r.type} />
              <Box
                sx={{
                  minWidth: isMobile ? "120px" : "0px",
                  overflow: "hidden",
                }}
              >
                {[
                  EVENT_TYPES.UNCATEGORIZED,
                  EVENT_TYPES.SCIENTIFIC_STUDY,
                  EVENT_TYPES.BOOK,
                ].includes(r.type) ? (
                  <Typography sx={{ fontSize: isMobile ? "0.875rem" : "1rem" }}>
                    {r.payload.title}
                  </Typography>
                ) : null}
                {r.type === EVENT_TYPES.DEATH && (
                  <ReferenceField source="payload.victim" reference="actors">
                    <TextField source="username" />
                  </ReferenceField>
                )}
              </Box>
            </Box>
          );
        }}
      />
      <FunctionField
        label="excerpt"
        render={(r) => {
          return !R.isEmpty(r.excerpt) ? (
            <Typography
              sx={{
                fontSize: isMobile ? "0.75rem" : "0.875rem",
                display: "-webkit-box",
                overflow: "hidden",
                textOverflow: "ellipsis",
                WebkitLineClamp: isMobile ? 1 : 2,
                WebkitBoxOrient: "vertical",
                minWidth: "200px",
              }}
            >
              {getTextContentsCapped(r.excerpt, 60)}
            </Typography>
          ) : (
            ""
          );
        }}
      />
      <FunctionField
        source="links"
        render={(r) => r.links?.length ?? 0}
        sx={{ minWidth: "80px", display: { xs: "none", md: "table-cell" } }}
      />
      <FunctionField
        source="media"
        render={(r) => r.media?.length ?? 0}
        sx={{ minWidth: "80px", display: { xs: "none", md: "table-cell" } }}
      />
      <FunctionField<RaRecord<string>>
        label="actors"
        source="payload"
        render={(r) => {
          if (r?.type === EVENT_TYPES.UNCATEGORIZED) {
            return r.payload.actors.length;
          }

          if (r?.type === EVENT_TYPES.SCIENTIFIC_STUDY) {
            return r.payload.authors.length;
          }

          return 1;
        }}
        sx={{ minWidth: "80px" }}
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
        sx={{ minWidth: "80px" }}
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
        sx={{ minWidth: "100px", display: { xs: "none", lg: "table-cell" } }}
      />
      <FunctionField<RaRecord<string>>
        label="Location"
        source="payload.location.coordinates"
        render={(r) => (r?.location?.coordinates ? <Icons.PinDrop /> : "-")}
        sx={{ minWidth: "80px", display: { xs: "none", lg: "table-cell" } }}
      />

      <DateField
        source="date"
        sx={{ minWidth: "120px", display: { xs: "none", sm: "table-cell" } }}
      />
      <FunctionField<RaRecord<string>>
        label="Dates"
        render={() => {
          return (
            <Box sx={{ minWidth: "200px" }}>
              <DateField source="updatedAt" />
              <DateField source="createdAt" />
              <DateField source="deletedAt" />
            </Box>
          );
        }}
        sx={{ display: { xs: "none", lg: "table-cell" } }}
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
      aside={<EventListAside />}
      sx={{
        "& .RaList-content": {
          "@media (max-width: 960px)": {
            width: "100%",
          },
        },
      }}
    >
      <EventDataGrid />
    </List>
  );
};
