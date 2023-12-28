import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  type FieldProps,
} from "react-admin";
import { useModal } from "../../../../hooks/useModal";
import { Box, Button } from "../../../mui";

const SelectThumbnailModalContent: React.FC<{
  thumbnails: string[];
  defaultThumbnail?: string;
  onClose: () => void;
  onThumbnailSelect: (t: string) => void;
}> = ({ thumbnails, defaultThumbnail, onClose, onThumbnailSelect }) => {
  const [thumbnail, setThumbnail] = React.useState(defaultThumbnail);

  return (
    <Box>
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
      <Box>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Close
        </Button>
        <Button
          onClick={() => {
            if (thumbnail) {
              onThumbnailSelect(thumbnail);
            }
            onClose();
          }}
        >
          Use the thumbnail
        </Button>
      </Box>
    </Box>
  );
};

export const GenerateThumbnailButton: React.FC<FieldProps> = (props) => {
  const record = useRecordContext(props);
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

  const [modal, showModal] = useModal();

  const handleThumbnailUpdate = React.useCallback((thumbnail: string) => {
    const data = { ...record, thumbnail };
    void apiProvider
      .update(`media`, {
        id: record.id,
        data,
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
          void apiProvider
            .post(`media/${record.id}/thumbnails`)
            .then((response: any) => {
              const thumbnails: string[] = response.data;

              showModal("Pick the thumbnail", (onClose) => {
                return (
                  <SelectThumbnailModalContent
                    thumbnails={thumbnails}
                    defaultThumbnail={record.thumbnail}
                    onClose={onClose}
                    onThumbnailSelect={handleThumbnailUpdate}
                  />
                );
              });
            });
        }}
      >
        Generate Thumbnail
      </Button>
      {modal}
    </Box>
  );
};
