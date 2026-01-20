import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import { type Group } from "@liexp/io/lib/http/Group.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import EventSlimCard from "@liexp/ui/lib/components/Cards/Events/EventSlimCard.js";
import { EventIcon } from "@liexp/ui/lib/components/Common/Icons/EventIcon.js";
import { ActorChip } from "@liexp/ui/lib/components/actors/ActorChip.js";
import { useGetMany } from "@liexp/ui/lib/components/admin/react-admin.js";
import { GroupChip } from "@liexp/ui/lib/components/groups/GroupChip.js";
import {
  Box,
  Chip,
  Icons,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";

/** Displays relation counts for an event */
const EventRelationChips: React.FC<{ event: Event }> = ({ event }) => {
  const relations = getRelationIds(event);
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      <Chip
        size="small"
        icon={<Icons.LinkIcon />}
        label={event.links.length}
        variant="outlined"
      />
      <Chip
        size="small"
        icon={<Icons.ImageIcon />}
        label={event.media.length}
        variant="outlined"
      />
      <Chip
        size="small"
        icon={<Icons.LabelIcon />}
        label={event.keywords.length}
        variant="outlined"
      />
      <Chip
        size="small"
        icon={<Icons.PersonIcon />}
        label={relations.actors.length}
        variant="outlined"
      />
      <Chip
        size="small"
        icon={<Icons.GroupsIcon />}
        label={relations.groups.length}
        variant="outlined"
      />
    </Stack>
  );
};

/** Compact event card for merge preview */
const MergeEventCard: React.FC<{
  event: Event;
  role: "target" | "source";
}> = ({ event, role }) => {
  const isTarget = role === "target";
  const bgColor = isTarget ? alpha("#4caf50", 0.1) : alpha("#f44336", 0.1);
  const borderColor = isTarget ? "#4caf50" : "#f44336";

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1.5,
        backgroundColor: bgColor,
        borderLeft: `4px solid ${borderColor}`,
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventIcon type={event.type} />
          <Typography variant="subtitle2" fontWeight="bold">
            {event.type}
          </Typography>
          <Chip
            size="small"
            label={isTarget ? "TARGET (keep)" : "SOURCE (delete)"}
            color={isTarget ? "success" : "error"}
            icon={isTarget ? <Icons.CheckIcon /> : <Icons.DeleteIcon />}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {formatDate(new Date(event.date))} — ID: {event.id.slice(0, 8)}...
        </Typography>
        <EventRelationChips event={event} />
      </Stack>
    </Paper>
  );
};

/** Summary of merged relations */
const MergeSummary: React.FC<{
  events: Event[];
  mergedEvent: Event | undefined;
}> = ({ events, mergedEvent }) => {
  if (!mergedEvent) return null;

  const totalLinks = events.reduce((sum, e) => sum + e.links.length, 0);
  const totalMedia = events.reduce((sum, e) => sum + e.media.length, 0);
  const totalKeywords = events.reduce((sum, e) => sum + e.keywords.length, 0);

  return (
    <Paper
      elevation={0}
      sx={{ p: 1.5, backgroundColor: alpha("#2196f3", 0.1) }}
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          Merge Summary
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icons.LinkIcon fontSize="small" />
            <Typography variant="body2">
              Links: {totalLinks} → {mergedEvent.links.length} (deduplicated)
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icons.ImageIcon fontSize="small" />
            <Typography variant="body2">
              Media: {totalMedia} → {mergedEvent.media.length}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Icons.LabelIcon fontSize="small" />
            <Typography variant="body2">
              Keywords: {totalKeywords} → {mergedEvent.keywords.length}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
};

/** Displays actor chips */
const ActorChips: React.FC<{ actors: Actor[] }> = ({ actors }) => {
  if (actors.length === 0) return null;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {actors.map((actor) => (
        <ActorChip key={actor.id} actor={actor} />
      ))}
    </Stack>
  );
};

/** Displays group chips */
const GroupChips: React.FC<{ groups: Group[] }> = ({ groups }) => {
  if (groups.length === 0) return null;
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {groups.map((group) => (
        <GroupChip key={group.id} group={group} />
      ))}
    </Stack>
  );
};

/** Merge result preview with fetched actors/groups */
const MergeResultPreview: React.FC<{
  mergedEvent: Event;
  actorIds: UUID[];
  groupIds: UUID[];
}> = ({ mergedEvent, actorIds, groupIds }) => {
  const { data: actors = [] } = useGetMany<Actor>(
    "actors",
    { ids: actorIds },
    { enabled: actorIds.length > 0 },
  );

  const { data: groups = [] } = useGetMany<Group>(
    "groups",
    { ids: groupIds },
    { enabled: groupIds.length > 0 },
  );

  return (
    <Paper
      elevation={1}
      sx={{ p: 1.5, backgroundColor: alpha("#2196f3", 0.05) }}
    >
      <Stack spacing={1.5}>
        <EventSlimCard
          event={mergedEvent}
          showMedia={false}
          showExcerpt
          sx={{ boxShadow: "none", backgroundColor: "transparent" }}
        />

        {actors.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              <Icons.PersonIcon
                fontSize="small"
                sx={{ verticalAlign: "middle", mr: 0.5 }}
              />
              Actors ({actors.length})
            </Typography>
            <ActorChips actors={actors} />
          </Box>
        )}

        {groups.length > 0 && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              <Icons.GroupsIcon
                fontSize="small"
                sx={{ verticalAlign: "middle", mr: 0.5 }}
              />
              Groups ({groups.length})
            </Typography>
            <GroupChips groups={groups} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export { MergeResultPreview, MergeEventCard, MergeSummary };
