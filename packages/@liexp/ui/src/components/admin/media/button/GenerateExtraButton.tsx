import { ImageMediaExtra } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import get from "lodash/get";
import * as React from "react";
import {
  BooleanInput,
  NumberInput,
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
} from "react-admin";
import { Box, Button, Stack, Typography } from "../../../mui/index.js";
import { DurationField } from "../DurationField.js";

export const GenerateExtraButton: React.FC<FieldProps<Media.Media>> = ({
  source = "extra",
  record: _record,
  ...props
}) => {
  const record = _record ?? useRecordContext<Media.Media>({ ...props, source });

  const extra = get<Media.Media, "extra">(record, source as "extra");
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
      if (Schema.is(ImageMediaExtra)(extra)) {
        return (
          <Stack direction="column" spacing={1}>
            <Typography variant="body1">Extra</Typography>
            <Stack direction="row" spacing={2}>
              <Box>
                <NumberInput
                  source="extra.width"
                  label="width"
                  value={extra.width}
                />
              </Box>
              <Box>
                <NumberInput
                  source="extra.height"
                  label="height"
                  value={extra.height}
                />
              </Box>
            </Stack>

            <BooleanInput
              source="extra.needRegenerateThumbnail"
              label="Need Regenerate Thumbnail"
              value={extra.needRegenerateThumbnail}
            />
          </Stack>
        );
      }

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
  }, [record, extra]);

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
