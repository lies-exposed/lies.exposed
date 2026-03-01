import { type Link } from "@liexp/io/lib/http/index.js";
import * as React from "react";
import {
  Alert,
  Box,
  Chip,
  Stack,
  Tooltip,
  Typography,
} from "../../../mui/index.js";
import {
  Button,
  useNotify,
  useRecordContext,
  useRefresh,
  useUpdate,
} from "../../react-admin.js";

interface MissingField {
  field: string;
  label: string;
}

const getMissingFields = (record: Link.Link): MissingField[] => {
  const missing: MissingField[] = [];

  if (!record.title) {
    missing.push({ field: "title", label: "Title" });
  }
  if (!record.description) {
    missing.push({ field: "description", label: "Description" });
  }
  if (!record.publishDate) {
    missing.push({ field: "publishDate", label: "Publish Date" });
  }

  return missing;
};

export const ApproveLinkButton: React.FC = () => {
  const record = useRecordContext<Link.Link>();
  const [update, { isPending }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) {
    return null;
  }

  const missingFields = getMissingFields(record);
  const isAlreadyApproved = record.status === "APPROVED";
  const canApprove = missingFields.length === 0 && !isAlreadyApproved;

  const handleApprove = () => {
    void update(
      "links",
      {
        id: record.id,
        data: { ...record, status: "APPROVED" },
        previousData: record,
      },
      {
        onSuccess: () => {
          notify("Link approved successfully", { type: "success" });
          refresh();
        },
        onError: () => {
          notify("Failed to approve link", { type: "error" });
        },
      },
    );
  };

  return (
    <Box>
      {missingFields.length > 0 ? (
        <Alert severity="warning" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Missing required fields to approve:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {missingFields.map(({ field, label }) => (
              <Chip
                key={field}
                label={label}
                color="warning"
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
        </Alert>
      ) : null}
      {!isAlreadyApproved ? (
        <Tooltip
          title={
            isAlreadyApproved
              ? "Already approved"
              : missingFields.length > 0
                ? `Missing: ${missingFields.map((f) => f.label).join(", ")}`
                : "Approve this link"
          }
        >
          <span>
            <Button
              label="Approve"
              variant="contained"
              color="primary"
              disabled={!canApprove || isPending}
              onClick={handleApprove}
            />
          </span>
        </Tooltip>
      ) : null}
    </Box>
  );
};
