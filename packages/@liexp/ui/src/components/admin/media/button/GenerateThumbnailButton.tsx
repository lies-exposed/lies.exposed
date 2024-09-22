import { ThumbnailsExtra } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import * as React from "react";
import {
  useRecordContext,
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
  const [thumbnail, setThumbnail] = React.useState(defaultThumbnail);

  if (ThumbnailsExtra.type.props.thumbnails.types[0].is(extra.thumbnails)) {
    return <Typography color="error">{extra.thumbnails.error}</Typography>;
  }

  return (
    <Stack direction={"column"} spacing={2}>
      <Stack
        direction="row"
        flexWrap={"wrap"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"center"}
      >
        {(extra.thumbnails ?? []).map((t) => (
          <Box
            key={t}
            onClick={() => {
              setThumbnail(t);
            }}
            style={{
              boxShadow: `0 0 5px ${thumbnail === t ? "blue" : "transparent"}`,
            }}
          >
            <img
              src={t}
              style={{
                width: extra.thumbnailWidth ?? 400,
                height: extra.thumbnailHeight ?? "auto",
              }}
            />
          </Box>
        ))}
      </Stack>
      <Button
        onClick={() => {
          if (thumbnail) {
            onThumbnailSelect(thumbnail);
          }
          onClose();
        }}
        variant="contained"
        label="Use the thumbnail"
      />
    </Stack>
  );
};

export const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  const record = useRecordContext(props);
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  const [modal, showModal] = useModal();

  const handleThumbnailUpdate = React.useCallback(
    (thumbnail: string) => {
      if (record?.id) {
        const { thumbnails, ...extra } = record?.extra ?? {};
        const data = {
          ...record,
          thumbnail,
          extra: {
            duration: undefined,
            ...extra,
            thumbnails: [],
          },
        };
        void apiProvider
          .update(`media`, {
            id: record.id,
            data,
            previousData: record,
          })
          .then(() => {
            refresh();
          });
      }
    },
    [record?.id, record?.thumbnail, record?.extra],
  );

  const handleThumbnailsGenerate = React.useCallback(() => {
    if (record?.id) {
      void apiProvider.post(`media/${record.id}/thumbnails`).then(() => {
        refresh();
      });
    }
  }, [record?.id]);

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
          ) : (
            <Button
              onClick={handleThumbnailsGenerate}
              label="Generate Thumbnail"
              variant="contained"
            />
          )}
        </Stack>
      );
    }

    return null;
  }, [record?.extra]);

  return (
    <Stack direction="row" spacing={2}>
      {thumbnailExtra}
      {modal}
    </Stack>
  );
};
