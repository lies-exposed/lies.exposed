import { formatDistanceToNow } from "date-fns";
import * as React from "react";
import { Alert, Box, Button, Collapse, Typography } from "../../mui/index.js";
import {
  useFormAutosave,
  type UseFormAutosaveOptions,
} from "./useFormAutosave.js";

export interface FormAutosaveProps extends UseFormAutosaveOptions {
  /** Render the "draft saved locally …" hint. Default `true`. */
  showStatus?: boolean;
}

/**
 * Drop-in recovery banner for react-admin edit/create forms. Caches the form to
 * `localStorage` while it is edited and, on the next mount, offers to restore an
 * unsaved draft. Place it as the first child of a `<SimpleForm>` /
 * `<TabbedForm.Tab>`.
 */
export const FormAutosave: React.FC<FormAutosaveProps> = ({
  showStatus = true,
  ...options
}) => {
  const { draft, restore, discard, lastSavedAt } = useFormAutosave(options);

  return (
    <Box width="100%">
      <Collapse in={draft !== null} unmountOnExit>
        <Alert
          severity="info"
          sx={{ mb: 1 }}
          action={
            <Box display="flex" gap={1}>
              <Button color="inherit" size="small" onClick={restore}>
                Restore
              </Button>
              <Button color="inherit" size="small" onClick={discard}>
                Discard
              </Button>
            </Box>
          }
        >
          {draft
            ? `Unsaved changes from this browser were found (${draft.savedAtLabel}). Restore them, or discard to keep the last saved version.`
            : null}
        </Alert>
      </Collapse>
      {showStatus && lastSavedAt ? (
        <Typography variant="caption" color="text.secondary">
          {`Draft saved locally ${formatDistanceToNow(lastSavedAt, {
            addSuffix: true,
          })}`}
        </Typography>
      ) : null}
    </Box>
  );
};
