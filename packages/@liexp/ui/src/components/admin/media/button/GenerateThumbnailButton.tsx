import {
  type ThumbnailsExtra,
  ThumbnailsExtraError,
} from "@liexp/io/lib/http/Media/MediaExtra.js";
import { Schema } from "effect";
import * as React from "react";
import {
  useRecordContext,
  useNotify,
  useRefresh,
  type FieldProps,
  Button,
  NumberInput,
} from "react-admin";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { useModal } from "../../../../hooks/useModal.js";
import { Box, Stack, Typography } from "../../../mui/index.js";

const SelectThumbnailModalContent: React.FC<{
  extra: ThumbnailsExtra;
  defaultThumbnail?: string;
  onClose: () => void;
  onThumbnailSelect: (t: string) => void;
}> = ({ extra, defaultThumbnail, onClose, onThumbnailSelect }) => {
  const [thumbnail, setThumbnail] = React.useState(
    defaultThumbnail ??
      (Array.isArray(extra.thumbnails) ? extra.thumbnails[0] : undefined),
  );

  if (Schema.is(ThumbnailsExtraError)(extra.thumbnails)) {
    return <Typography color="error">{extra.thumbnails.error}</Typography>;
  }

  return (
    <Stack
      direction={"column"}
      spacing={3}
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 2,
          maxHeight: "60vh",
          overflowY: "auto",
          p: 1,
          flex: 1,
        }}
      >
        {(extra.thumbnails ?? []).map((t) => (
          <Box
            key={t}
            onClick={() => {
              setThumbnail(t);
            }}
            sx={{
              cursor: "pointer",
              border: thumbnail === t ? "3px solid" : "2px solid",
              borderColor: thumbnail === t ? "primary.main" : "grey.300",
              borderRadius: 1,
              overflow: "hidden",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: "primary.light",
                transform: "scale(1.02)",
                boxShadow: 2,
              },
              backgroundColor:
                thumbnail === t ? "primary.light" : "transparent",
              opacity: thumbnail === t ? 1 : 0.8,
            }}
          >
            <Box
              sx={{
                position: "relative",
                paddingTop:
                  extra.thumbnailHeight && extra.thumbnailWidth
                    ? `${(extra.thumbnailHeight / extra.thumbnailWidth) * 100}%`
                    : "56.25%", // 16:9 default aspect ratio
                width: "100%",
              }}
            >
              <img
                src={t}
                alt="Thumbnail option"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => {
            if (thumbnail) {
              onThumbnailSelect(thumbnail);
            }
            onClose();
          }}
          variant="contained"
          label="Use the thumbnail"
          disabled={!thumbnail}
          size="large"
        />
      </Box>
    </Stack>
  );
};

export const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  const record = useRecordContext(props);
  const refresh = useRefresh();
  const notify = useNotify();
  const apiProvider = useDataProvider();
  const [modal, showModal] = useModal();
  const [generating, setGenerating] = React.useState(false);

  const handleThumbnailUpdate = React.useCallback(
    (thumbnail: string) => {
      if (record?.id) {
        const { thumbnails: _thumbnails, ...extra } = record?.extra ?? {};
        const data = {
          ...record,
          thumbnail,
          extra: {
            duration: undefined,
            ...extra,
            thumbnails: [],
          },
          overrideExtra: true,
        };
        void apiProvider
          .update(`media`, {
            id: record.id,
            data,
            previousData: record,
          })
          .then(() => {
            notify("Thumbnail updated", { type: "success" });
            refresh();
          })
          .catch((e: Error) => {
            notify(`Thumbnail update failed: ${e.message}`, { type: "error" });
          });
      }
    },
    [record?.id, record?.thumbnail, record?.extra],
  );

  const handleThumbnailsGenerate = React.useCallback(() => {
    if (record?.id) {
      setGenerating(true);
      void apiProvider
        .post(`media/${record.id}/thumbnails`)
        .then(() => {
          notify(
            "Thumbnail generation queued. Refresh in a few seconds to see the result.",
            { type: "info" },
          );
          refresh();
        })
        .catch((e: Error) => {
          notify(`Thumbnail generation failed: ${e.message}`, {
            type: "error",
          });
        })
        .finally(() => {
          setGenerating(false);
        });
    }
  }, [record?.id]);

  const thumbnailsError = Schema.is(ThumbnailsExtraError)(
    record?.extra?.thumbnails,
  )
    ? record?.extra?.thumbnails.error
    : undefined;

  const handleThumbnailPick = React.useCallback(() => {
    showModal("Pick the thumbnail", (onClose) => {
      return (
        <SelectThumbnailModalContent
          extra={record?.extra}
          defaultThumbnail={record?.thumbnail}
          onClose={onClose}
          onThumbnailSelect={handleThumbnailUpdate}
        />
      );
    });
  }, [record?.thumbnail, record?.extra?.thumbnails]);

  const thumbnailExtra = React.useMemo(() => {
    if (record?.extra) {
      const thumbnails = record?.extra?.thumbnails ?? [];
      return (
        <Stack>
          <Stack direction="row" spacing={2}>
            <Box>
              <NumberInput
                source="extra.thumbnailWidth"
                label="Thumb Width"
                size="small"
              />
            </Box>
            <Box>
              <NumberInput
                source="extra.thumbnailHeight"
                label="Thumb Height"
                size="small"
              />
            </Box>
          </Stack>

          {thumbnails.length > 0 ? (
            <Button
              onClick={handleThumbnailPick}
              label={`Pick a thumbnail (${thumbnails.length})`}
              variant="outlined"
            />
          ) : null}
        </Stack>
      );
    }

    return null;
  }, [record?.extra]);

  return (
    <Stack direction="column" spacing={2}>
      {thumbnailExtra}
      {thumbnailsError ? (
        <Typography color="error" variant="body2">
          Last generation failed: {thumbnailsError}
        </Typography>
      ) : null}
      <Button
        onClick={handleThumbnailsGenerate}
        label={generating ? "Queueing..." : "Generate Thumbnail"}
        variant="contained"
        disabled={generating}
      />
      {modal}
    </Stack>
  );
};
