import { get } from "lodash";
import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
} from "react-admin";
import { Button, Stack, Typography } from "../../../mui";
import { DurationField } from "../DurationField";

export const GenerateExtraButton: React.FC<FieldProps> = ({
  source = "extra",
  ...props
}) => {
  const record = useRecordContext(props);
  const extra = get(record, source);
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

  // wrap $extra in react memo
  const extraFields = React.useMemo(() => {
    if (extra) {
      return (
        <Stack direction="column" spacing={2}>
          <Typography variant="body1">Extra</Typography>
          {extra.duration ? (
            <DurationField source="extra.duration" label="duration" />
          ) : null}
        </Stack>
      );
    }
    return null;
  }, [extra]);

  return (
    <Stack spacing={2} padding={2}>
      {extraFields}
      <Button
        onClick={() => {
          handleExtraUpdate();
        }}
      >
        Generate Extra
      </Button>
    </Stack>
  );
};
