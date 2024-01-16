import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "react-admin";
import { Box } from "../../mui/index.js";

interface UpdateMetadataButtonProps {
  type: EventType;
}

export const UpdateMetadataButton: React.FC<UpdateMetadataButtonProps> = ({
  type,
}) => {
  const refresh = useRefresh();
  const record = useRecordContext();
  const apiProvider = useDataProvider();

  const handleUpdateMetadata = React.useCallback((): void => {
    void apiProvider
      .put(`/scientific-studies/${record.id}/extract`, {
        data: {
          type,
        },
      })
      .then(() => {
        refresh();
      });
  }, []);

  return (
    <Box display="flex" style={{ marginRight: 10 }}>
      <Button
        label="Update from URL"
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          handleUpdateMetadata();
        }}
      />
    </Box>
  );
};
