import { getTitle } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import type { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useAPI } from "../../../hooks/useAPI.js";
import { EventIcon } from "../../Common/Icons/index.js";
import { AutocompleteEventInput } from "../../Input/AutocompleteEventInput.js";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "../../mui/index.js";
import {
  ReferenceInput,
  useNotify,
  useRecordContext,
  useRefresh,
} from "../react-admin.js";

interface LinkExistingEventsButtonProps {
  /** The type of entity: 'actors' or 'groups' */
  entityType: "actors" | "groups";
  /** Optional list of event IDs to exclude (already linked) */
  excludeEventIds?: UUID[];
}

export const LinkExistingEventsButton: React.FC<
  LinkExistingEventsButtonProps
> = ({ entityType }) => {
  const record = useRecordContext<{ id: UUID }>();
  const api = useAPI();
  const notify = useNotify();
  const refresh = useRefresh();

  const [open, setOpen] = React.useState(false);
  const [selectedEvents, setSelectedEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchKey, setSearchKey] = React.useState(0);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedEvents([]);
    setSearchKey((k) => k + 1);
  };

  const handleEventSelect = (eventRecord: Event[]) => {
    setSelectedEvents(eventRecord);
    // Reset the input by incrementing key
    setSearchKey((k) => k + 1);
  };

  const handleRemoveSelected = (eventId: UUID) => {
    setSelectedEvents(selectedEvents.filter((e) => e.id !== eventId));
  };

  const handleConfirm = async () => {
    if (!record || selectedEvents.length === 0) return;

    setLoading(true);
    try {
      const linkEndpoint =
        entityType === "actors"
          ? api.Actor.Custom.LinkEvents
          : api.Group.Custom.LinkEvents;

      const result = await pipe(
        linkEndpoint({
          Params: { id: record.id },
          Body: { eventIds: selectedEvents.map((e) => e.id) },
        }),
        throwTE,
      );

      const { linked, failed } = result.data;

      if (linked.length > 0) {
        notify(`Successfully linked ${linked.length} event(s)`, {
          type: "success",
        });
      }
      if (failed.length > 0) {
        const reasons = failed.map((f) => f.reason).join(", ");
        notify(`Failed to link ${failed.length} event(s): ${reasons}`, {
          type: "warning",
        });
      }

      refresh();
      handleClose();
    } catch (error) {
      notify("Error linking events", { type: "error", messageArgs: error });
    } finally {
      setLoading(false);
    }
  };

  if (!record) {
    return null;
  }

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<LinkIcon />}
        onClick={handleOpen}
        size="small"
      >
        Link Existing Events
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Link Existing Events to {entityType === "actors" ? "Actor" : "Group"}
        </DialogTitle>
        <DialogContent style={{ minHeight: 300 }}>
          <Box sx={{ mb: 2, mt: 1 }}>
            <ReferenceInput
              key={searchKey}
              source="_eventSearch"
              reference="events"
              filter={{ withDrafts: true }}
            >
              <AutocompleteEventInput
                discrete={false}
                onChange={handleEventSelect}
                selectedItems={selectedEvents}
                style={{
                  zIndex: 1000,
                }}
              />
            </ReferenceInput>
          </Box>

          {selectedEvents.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Selected Events ({selectedEvents.length}):
              </Typography>
              <List dense>
                {selectedEvents.map((event) => (
                  <ListItem
                    key={event.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveSelected(event.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <EventIcon type={event.type} style={{ marginRight: 10 }} />
                    <ListItemText
                      primary={getTitle(event, {
                        media: [],
                        links: [],
                        keywords: [],
                        areas: [],
                        groups: [],
                        actors: [],
                        groupsMembers: [],
                      })}
                      secondary={event.id}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              void handleConfirm();
            }}
            variant="contained"
            disabled={loading || selectedEvents.length === 0}
            startIcon={loading ? <CircularProgress size={16} /> : <LinkIcon />}
          >
            Link {selectedEvents.length} Event(s)
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LinkExistingEventsButton;
