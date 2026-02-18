import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type Event, EventType } from "@liexp/io/lib/http/Events/index.js";
import { takeEventRelations } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { MergeEventsHelper } from "@liexp/shared/lib/helpers/event/merge-event.helper.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { EventIcon } from "@liexp/ui/lib/components/Common/Icons/EventIcon.js";
import { LinkIcon } from "@liexp/ui/lib/components/Common/Icons/index.js";
import ReferenceArrayActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceArrayActorInput.js";
import ExcerptField from "@liexp/ui/lib/components/admin/common/ExcerptField.js";
import ReferenceArrayGroupMemberInput from "@liexp/ui/lib/components/admin/common/ReferenceArrayGroupMemberInput.js";
import { EventTypeSelect } from "@liexp/ui/lib/components/admin/common/inputs/EventTypeInput.js";
import ReferenceArrayGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceArrayGroupInput.js";
import ReferenceArrayKeywordInput from "@liexp/ui/lib/components/admin/keywords/ReferenceArrayKeywordInput.js";
import {
  BooleanField,
  BooleanInput,
  BulkDeleteButton,
  Button,
  Confirm,
  Datagrid,
  DateField,
  DateInput,
  FilterList,
  FilterListItem,
  FilterLiveSearch,
  FunctionField,
  List,
  NumberInput,
  ReferenceField,
  SavedQueriesList,
  TextField,
  useListContext,
  useNotify,
  useRefresh,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Icons,
  Stack,
  Typography,
  alpha,
} from "@liexp/ui/lib/components/mui/index.js";
import { useAPI } from "@liexp/ui/lib/hooks/useAPI.js";
import { type ReadonlyNonEmptyArray } from "fp-ts/lib/ReadonlyNonEmptyArray.js";
import * as React from "react";
import {
  MergeResultPreview,
  MergeEventCard,
  MergeSummary,
} from "../../components/MergedEventPreview.js";

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
  <ReferenceArrayGroupInput key="groups" source="groups" />,
  <ReferenceArrayActorInput key="actors" source="actors" />,
  <ReferenceArrayGroupMemberInput key="groupsMembers" source="groupsMembers" />,
  <DateInput key="startDate" source="startDate" />,
  <DateInput key="endDate" source="endDate" />,
];

const MergeEventsButton = () => {
  const [clicked, setClicked] = React.useState(false);
  const [toType, setToType] = React.useState<EventType>(
    EVENT_TYPES.UNCATEGORIZED,
  );
  const { selectedIds, data } = useListContext();
  const api = useAPI();
  const refresh = useRefresh();
  const notify = useNotify();

  // Sort events by selected order to ensure predictable target selection
  const events = selectedIds
    .map((id) => (data ?? []).find((e) => e.id === id))
    .filter((e): e is Event => e !== undefined);

  const [targetEvent, ...sourceEvents] = events;

  const onClick = () => {
    setClicked(true);
    // Set initial type to match target event
    if (targetEvent) {
      setToType(targetEvent.type);
    }
  };

  const onSubmit = () => {
    if (toType) {
      void pipe(
        api.Event.Custom.EditManyEvents({
          Params: undefined,
          Body: {
            params: {
              ids: selectedIds,
              action: "merge",
              toType,
            },
          },
        }),
        throwTE,
      )
        .then(() => {
          notify("Events merged successfully", { type: "success" });
          refresh();
        })
        .catch((err) => {
          notify(err.message, { type: "error" });
        });
    }
  };

  // Extract all relation IDs from events for fetching
  const allRelationIds = React.useMemo(() => {
    if (events.length === 0) {
      return { actors: [], groups: [], groupsMembers: [] };
    }
    return takeEventRelations(events);
  }, [events]);

  const mergedEvent = pipe(
    events as readonly Event[],
    fp.O.fromPredicate(
      (ev): ev is ReadonlyNonEmptyArray<Event> => toType && fp.A.isNonEmpty(ev),
    ),
    fp.O.map((ev) =>
      MergeEventsHelper.mergeEvents(ev, toType, {
        groups: [],
        actors: [],
        links: [],
        media: [],
        keywords: [],
        groupsMembers: [],
        areas: [],
      }),
    ),
    fp.O.toUndefined,
  );

  const canMerge = events.length >= 2;

  return (
    <>
      <Button
        startIcon={<Icons.MergeTypeIcon />}
        label="Merge"
        onClick={onClick}
        disabled={!canMerge}
      />
      <Confirm
        isOpen={clicked}
        title={`Merge ${events.length} events`}
        content={
          <Stack spacing={2} sx={{ minWidth: 500 }}>
            {/* Target Event Section */}
            {targetEvent && (
              <Box>
                <Typography
                  variant="overline"
                  color="success.main"
                  fontWeight="bold"
                >
                  Target Event (will be kept)
                </Typography>
                <MergeEventCard event={targetEvent} role="target" />
              </Box>
            )}

            <Divider />

            {/* Source Events Section */}
            {sourceEvents.length > 0 && (
              <Box>
                <Typography
                  variant="overline"
                  color="error.main"
                  fontWeight="bold"
                >
                  Source Events (will be soft-deleted)
                </Typography>
                <Stack spacing={1}>
                  {sourceEvents.map((e) => (
                    <MergeEventCard key={e.id} event={e} role="source" />
                  ))}
                </Stack>
              </Box>
            )}

            <Divider />

            {/* Event Type Selection */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2">Target event type:</Typography>
              <EventTypeSelect eventType={toType} onChange={setToType} />
            </Stack>

            {/* Merge Summary */}
            <MergeSummary events={events} mergedEvent={mergedEvent} />

            {/* Result Preview */}
            {mergedEvent ? (
              <MergeResultPreview
                mergedEvent={mergedEvent}
                actorIds={[...allRelationIds.actors]}
                groupIds={[...allRelationIds.groups]}
              />
            ) : null}
          </Stack>
        }
        onConfirm={onSubmit}
        onClose={() => {
          setClicked(false);
        }}
        confirmColor="primary"
      />
    </>
  );
};

const PostBulkActionButtons = () => (
  <>
    <MergeEventsButton />
    <BulkDeleteButton />
  </>
);

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
          {EventType.members.map((t) => (
            <FilterListItem
              key={t.literals[0]}
              label={
                <span>
                  <EventIcon type={t.literals[0]} /> {t.literals[0]}
                </span>
              }
              value={{ eventType: [t.literals[0]] }}
            />
          ))}
        </FilterList>
      </CardContent>
    </Card>
  );
};

const EventList: React.FC = () => (
  <List
    resource={RESOURCE}
    filterDefaultValues={{
      withDeleted: true,
      draft: undefined,
    }}
    filters={eventsFilter}
    perPage={25}
    sort={{ field: "createdAt", order: "DESC" }}
    aside={<EventListAside />}
  >
    <Datagrid
      rowSx={(record) => {
        return {
          backgroundColor: record.deletedAt ? alpha("#FF0000", 0.6) : undefined,
        };
      }}
      rowClick={(_props, _id, record) => {
        if (record.type === EVENT_TYPES.SCIENTIFIC_STUDY) {
          return `/scientific-studies/${record.id}`;
        }

        if (record.type === EVENT_TYPES.DEATH) {
          return `/deaths/${record.id}`;
        }

        if (record.type === EVENT_TYPES.PATENT) {
          return `/patents/${record.id}`;
        }

        if (record.type === EVENT_TYPES.DOCUMENTARY) {
          return `/documentaries/${record.id}`;
        }

        if (record.type === EVENT_TYPES.TRANSACTION) {
          return `/transactions/${record.id}`;
        }

        return `/events/${record.id}`;
      }}
      bulkActionButtons={<PostBulkActionButtons />}
    >
      <BooleanField source="draft" />
      <FunctionField
        label="type"
        render={(r) => {
          const title = r?.payload?.title ?? r?.payload?.quote ?? r?.payload?.details;
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
      <ExcerptField label="excerpt" source="excerpt" />
      <FunctionField source="links" render={(r) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r) => r.media?.length ?? 0} />
      <FunctionField
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
      />

      <FunctionField
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
      <FunctionField
        source="socialPosts"
        render={(r) => r.socialPosts?.length ?? 0}
      />
      <FunctionField
        label="groupsMembers"
        source="payload"
        render={(r) => {
          if (r?.type === EVENT_TYPES.UNCATEGORIZED) {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === EVENT_TYPES.SCIENTIFIC_STUDY) {
            return 0;
          }

          return 1;
        }}
      />
      <FunctionField
        label="Location"
        source="payload.location.coordinates"
        render={(r) => (r?.location?.coordinates ? <Icons.PinDrop /> : "-")}
      />

      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

export default EventList;
