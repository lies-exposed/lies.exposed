import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
  Button,
} from "react-admin";
import { useModal } from "../../../../hooks/useModal.js";
import { Box, Stack } from "../../../mui/index.js";

const SelectThumbnailModalContent: React.FC<{
  thumbnails: string[];
  defaultThumbnail?: string;
  onClose: () => void;
  onThumbnailSelect: (t: string) => void;
}> = ({ thumbnails, defaultThumbnail, onClose, onThumbnailSelect }) => {
  const [thumbnail, setThumbnail] = React.useState(defaultThumbnail);

  return (
    <Stack direction={"column"} spacing={2}>
      <Stack direction="row" flexWrap={"wrap"} spacing={2} height={100}>
        {thumbnails.map((t) => (
          <Box
            key={t}
            onClick={() => {
              setThumbnail(t);
            }}
          >
            <img src={t} style={{ width: 400, height: 100 }} />
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
        variant="outlined"
        label="Use the thumbnail"
      />
    </Stack>
  );
};

export const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  const record = useRecordContext(props);
  const refresh = useRefresh();
  const apiProvider = useDataProvider<any>();
  const [modal, showModal] = useModal();

  const thumbnails = record?.extra?.thumbnails ?? [];

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
    [record?.id, record?.thumbnail, thumbnails],
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
          thumbnails={record?.extra?.thumbnails}
          defaultThumbnail={record?.thumbnail}
          onClose={onClose}
          onThumbnailSelect={handleThumbnailUpdate}
        />
      );
    });
  }, [record?.thumbnail, record?.extra?.thumbnails]);

  return (
    <Stack direction="row" spacing={2}>
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
      {modal}
    </Stack>
  );
};
