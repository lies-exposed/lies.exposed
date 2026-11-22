import { ImageMediaExtra } from "@liexp/io/lib/http/Media/MediaExtra.js";
import { type Media } from "@liexp/io/lib/http/index.js";
import { Schema } from "effect";
import get from "lodash/get";
import * as React from "react";
import {
  BooleanInput,
  NumberInput,
  useDataProvider,
  useNotify,
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
  const notify = useNotify();
  const apiProvider = useDataProvider();
  const [generating, setGenerating] = React.useState(false);

  const handleExtraUpdate = React.useCallback((media: Media.Media) => {
    setGenerating(true);
    void apiProvider
      .update(`media`, {
        id: media.id,
        data: { ...media, overrideExtra: true },
        previousData: media,
      })
      .then(() => {
        notify(
          "Extra generation queued. Refresh in a few seconds to see the result.",
          { type: "info" },
        );
        refresh();
      })
      .catch((e: Error) => {
        notify(`Extra generation failed: ${e.message}`, { type: "error" });
      })
      .finally(() => {
        setGenerating(false);
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
        disabled={generating}
        onClick={() => {
          handleExtraUpdate(record);
        }}
      >
        {generating ? "Queueing..." : "Generate Extra"}
      </Button>
    </Stack>
  );
};
