import {
  EventType,
  EventTypes,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { Events } from "@liexp/shared/lib/io/http/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { EventIcon } from "@liexp/ui/lib/components/Common/Icons/EventIcon.js";
import { LinkIcon } from "@liexp/ui/lib/components/Common/Icons/index.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import ReferenceArrayGroupMemberInput from "@liexp/ui/lib/components/admin/common/ReferenceArrayGroupMemberInput.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab.js";
import { DocumentaryEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DocumentaryEditFormTab.js";
import { PatentEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/PatentEventEditTab.js";
import { QuoteEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/QuoteEditFormTab.js";
import { ScientificStudyEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/ScientificStudyEventEditTab.js";
import { UncategorizedEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/UncategorizedEventEditTab.js";
import { EventTitle } from "@liexp/ui/lib/components/admin/events/titles/EventTitle.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import {
  BooleanField,
  BooleanInput,
  Datagrid,
  DateField,
  DateInput,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  FormDataConsumer,
  FunctionField,
  List,
  NumberInput,
  ReferenceField,
  SavedQueriesList,
  TextField,
  type RaRecord as Record,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import {
  Box,
  Card,
  CardContent,
  Icons,
  Stack,
  Typography,
  alpha,
} from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";

const RESOURCE = "events";

const eventsFilter = [
  <ReferenceArrayKeywordInput
    key="keywords"
    source="keywords"
    showAdd={false}
    alwaysOn
  />,
  <BooleanInput
    key="draft"
    label="Draft"
    source="draft"
    defaultValue={false}
    alwaysOn
    size="small"
  />,
  <BooleanInput key="withDeleted" source="withDeleted" alwaysOn size="small" />,
  <BooleanInput
    key="onlyUnshared"
    source="onlyUnshared"
    alwaysOn
    size="small"
  />,
  <NumberInput
    key="spCount"
    label="Social Post Count"
    source="spCount"
    size="small"
  />,
  <ReferenceArrayGroupInput key="groups" source="groups" size="small" />,
  <ReferenceArrayActorInput key="actors" source="actors" />,
  <ReferenceArrayGroupMemberInput key="groupsMembers" source="groupsMembers" />,
  <DateInput key="startDate" source="startDate" />,
  <DateInput key="endDate" source="endDate" />,
];

export const EventList: React.FC = () => (
  <List
    resource={RESOURCE}
    filterDefaultValues={{
      withDeleted: true,
      draft: undefined,
    }}
    filters={eventsFilter}
    perPage={25}
    sort={{ field: "createdAt", order: "DESC" }}
    aside={
      <Card
        sx={{
          order: -1,
          mr: 2,
          mt: 0,
          width: 300,
          display: "flex",
          flex: "1 0 auto",
        }}
      >
        <CardContent>
          <SavedQueriesList />
          <FilterLiveSearch label="Search" source="q" />
          <FilterList label="Media" icon={<Icons.PlayCircleOutline />}>
            <FilterListItem label="Empty Media" value={{ emptyMedia: true }} />
          </FilterList>
          <FilterList label="Links" icon={<LinkIcon />}>
            <FilterListItem label="Empty Links" value={{ emptyLinks: true }} />
          </FilterList>
          <FilterList label="Type" icon={<EventIcon type="Uncategorized" />}>
            {EventType.types.map((t) => (
              <FilterListItem
                key={t.value}
                label={
                  <span>
                    <EventIcon type={t.value} /> {t.value}
                  </span>
                }
                value={{ eventType: [t.value] }}
              />
            ))}
          </FilterList>
        </CardContent>
      </Card>
    }
  >
    <Datagrid
      rowSx={(record) => {
        return {
          backgroundColor: record.deletedAt ? alpha("#FF0000", 0.6) : undefined,
        };
      }}
      rowClick={(_props, _id, record) => {
        if (record.type === http.Events.EventTypes.SCIENTIFIC_STUDY.value) {
          return `/scientific-studies/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.DEATH.value) {
          return `/deaths/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.PATENT.value) {
          return `/patents/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.DOCUMENTARY.value) {
          return `/documentaries/${record.id}`;
        }

        if (record.type === http.Events.EventTypes.TRANSACTION.value) {
          return `/transactions/${record.id}`;
        }

        return `/events/${record.id}`;
      }}
    >
      <BooleanField source="draft" />
      <FunctionField
        label="type"
        render={(r: any) => {
          const title = r.payload.title ?? r.payload.quote ?? r.payload.details;
          return (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon color="primary" type={r.type} />
                <Typography display="inline" variant="subtitle1">
                  {r.type}
                </Typography>
              </Stack>
              {title ? (
                <Typography style={{ display: "block" }}>{title}</Typography>
              ) : undefined}
              {r.payload.victim ? (
                <ReferenceField source="payload.victim" reference="actors">
                  <TextField source="username" />
                </ReferenceField>
              ) : undefined}
            </Box>
          );
        }}
      />
      <ExcerptField label="excerpt" />
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r: any) => r.media?.length ?? 0} />
      <FunctionField
        label="actors"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === Events.EventTypes.UNCATEGORIZED.value) {
            return r.payload.actors.length;
          }

          if (r?.type === Events.EventTypes.SCIENTIFIC_STUDY.value) {
            return r.payload.authors.length;
          }

          return 1;
        }}
      />

      <FunctionField
        label="groups"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.groups.length;
          }

          if (r?.type === "ScientificStudy") {
            return r.payload.publisher ? 1 : 0;
          }

          return 0;
        }}
      />
      <FunctionField
        source="socialPosts"
        render={(r: any) => r.socialPosts?.length ?? 0}
      />
      <FunctionField
        label="groupsMembers"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === http.Events.EventTypes.UNCATEGORIZED.value) {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === http.Events.EventTypes.SCIENTIFIC_STUDY.value) {
            return 0;
          }

          return 1;
        }}
      />
      <FunctionField
        label="Location"
        source="payload.location.coordinates"
        render={(r: Record | undefined) =>
          r?.location?.coordinates ? <Icons.PinDrop /> : "-"
        }
      />

      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export const EventEdit: React.FC = (props) => {
  return (
    <EditEventForm {...props} title={<EventTitle />} redirect={false}>
      {(suggestions, handlers) => (
        <FormDataConsumer>
          {({ formData, getSource, scopedFormData, ...rest }) => {
            if (formData.type === EventTypes.DOCUMENTARY.value) {
              return <DocumentaryEditFormTab />;
            }
            if (formData.type === EventTypes.DEATH.value) {
              return <DeathEventEditFormTab />;
            }
            if (formData.type === EventTypes.SCIENTIFIC_STUDY.value) {
              return <ScientificStudyEventEditTab />;
            }
            if (formData.type === EventTypes.QUOTE.value) {
              return <QuoteEditFormTab />;
            }
            if (formData.type === EventTypes.PATENT.value) {
              return <PatentEventEditFormTab />;
            }

            if (formData.type === EventTypes.BOOK.value) {
              return <BookEditFormTab />;
            }

            return (
              <UncategorizedEventEditTab
                suggestions={suggestions}
                handlers={handlers}
                record={formData as any}
              />
            );
          }}
        </FormDataConsumer>
      )}
    </EditEventForm>
  );
};
