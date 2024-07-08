import { type ScientificStudy, type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
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
  const record = useRecordContext<ScientificStudy.ScientificStudy>();
  const apiProvider = useDataProvider();

  const handleUpdateMetadata = React.useCallback((scientificStudy: ScientificStudy.ScientificStudy): void => {
    void apiProvider
      .put(`/scientific-studies/${scientificStudy.id}/extract`, {
        data: {
          type,
        },
      })
      .then(() => {
        refresh();
      });
  }, [apiProvider]);

  return record &&(
    <Box display="flex" style={{ marginRight: 10 }}>
      <Button
        label="Update from URL"
        color="secondary"
        variant="contained"
        size="small"
        onClick={() => {
          handleUpdateMetadata(record);
        }}
      />
    </Box>
  );
};
