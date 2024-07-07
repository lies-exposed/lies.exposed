import { type Media } from "@liexp/shared/lib/io/http/index.js";
import get from "lodash/get";
import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
} from "react-admin";
import { Button, Stack, Typography } from "../../../mui/index.js";
import { DurationField } from "../DurationField.js";

export const GenerateExtraButton: React.FC<FieldProps<Media.Media>> = ({
  source = "extra",
  record: _record,
  ...props
}) => {
  const record: any =
    _record ?? useRecordContext<Media.Media>({ ...props, source: "media" });
  const extra = get(record, source);
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

  const handleExtraUpdate = React.useCallback((media: Media.Media) => {
    void apiProvider
      .update(`media`, {
        id: media.id,
        data: { ...media, overrideExtra: true },
        previousData: media,
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

  if (!record) {
    return null;
  }

  return (
    <Stack spacing={2} padding={2}>
      {extraFields}
      <Button
        onClick={() => {
          handleExtraUpdate(record);
        }}
      >
        Generate Extra
      </Button>
    </Stack>
  );
};
