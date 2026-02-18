import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { toAPIError } from "@liexp/shared/lib/utils/APIError.utils.js";
import * as React from "react";
import {
  Button,
  useDataProvider,
  useGetList,
  useNotify,
  useRecordContext,
  useRefresh,
} from "react-admin";
import {
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "../../mui/index.js";

export const MergeActorButton: React.FC = () => {
  const record = useRecordContext<Actor>();
  const apiProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = React.useState(false);
  const [targetActorId, setTargetActorId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch actors for the autocomplete
  const { data: actors, isLoading: actorsLoading } = useGetList<Actor>(
    "actors",
    {
      pagination: { page: 1, perPage: 100 },
      sort: { field: "fullName", order: "ASC" },
      filter: searchQuery ? { q: searchQuery } : {},
    },
    { enabled: open },
  );

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
    setTargetActorId(null);
  };

  const handleMerge = async (): Promise<void> => {
    if (!record?.id || !targetActorId) {
      notify("Please select a target actor", { type: "warning" });
      return;
    }

    if (record.id === targetActorId) {
      notify("Cannot merge an actor into itself", { type: "warning" });
      return;
    }

    setLoading(true);
    try {
      await apiProvider.create("actors/merge", {
        data: {
          sourceId: record.id,
          targetId: targetActorId,
        },
      });

      notify("Actor merged successfully", { type: "success" });
      handleClose();
      refresh();
      // Redirect to the target actor
      window.location.href = `/#/actors/${targetActorId}`;
    } catch (error: unknown) {
      notify(`Error merging actor: ${toAPIError(error).message}`, { type: "error" });
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
        label="Merge Actor"
        color="primary"
        onClick={handleOpen}
        disabled={loading}
      />
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Merge &quot;{record.fullName}&quot; into another actor
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <p style={{ marginBottom: 16 }}>
              This will transfer all relations (events, stories, nationalities)
              from &quot;{record.fullName}&quot; to the selected actor. Group
              memberships of &quot;{record.fullName}&quot; will be removed when
              the actor is deleted.
            </p>
            <p style={{ marginBottom: 16, fontWeight: "bold", color: "red" }}>
              This action cannot be undone!
            </p>
            <Autocomplete
              options={actors ?? []}
              getOptionLabel={(option: Actor) => option.fullName}
              loading={actorsLoading}
              value={actors?.find((a) => a.id === targetActorId) ?? null}
              onChange={(_event, newValue) => {
                setTargetActorId(newValue?.id ?? null);
              }}
              onInputChange={(_event, newInputValue) => {
                setSearchQuery(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Target Actor"
                  variant="outlined"
                  fullWidth
                />
              )}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button label="Cancel" onClick={handleClose} disabled={loading} />
          <Button
            label="Merge"
            onClick={() => {
              void handleMerge();
            }}
            disabled={!targetActorId || loading}
            color="primary"
          />
        </DialogActions>
      </Dialog>
    </>
  );
};
