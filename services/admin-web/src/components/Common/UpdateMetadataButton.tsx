import { EventType } from "@liexp/shared/io/http/Events";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import { Button, useRecordContext, useRefresh } from "react-admin";
import { apiProvider } from "@client/HTTPAPI";

interface UpdateMetadataButtonProps {
  type: EventType;
}

export const UpdateMetadataButton: React.FC<UpdateMetadataButtonProps> = ({
  type,
}) => {
  const refresh = useRefresh();
  const record = useRecordContext();

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
