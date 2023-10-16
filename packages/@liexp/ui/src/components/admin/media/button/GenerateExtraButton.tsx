import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
} from "react-admin";
import { Box, Button } from "../../../mui";

export const GenerateExtraButton: React.FC<FieldProps> = (props) => {
  const record = useRecordContext(props);
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

  const handleExtraUpdate = React.useCallback(() => {
    void apiProvider
      .update(`media`, {
        id: record.id,
        data: { ...record, overrideExtra: true },
        previousData: record,
      })
      .then(() => {
        refresh();
      });
  }, []);

  return (
    <Box>
      <Button
        onClick={() => {
          handleExtraUpdate();
        }}
      >
        Generate Extra
      </Button>
    </Box>
  );
};
