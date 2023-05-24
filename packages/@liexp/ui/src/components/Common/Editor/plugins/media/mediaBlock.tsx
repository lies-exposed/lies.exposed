import { type Media } from "@liexp/shared/lib/io/http";
import { MEDIA_BLOCK_PLUGIN } from "@liexp/shared/lib/slate/plugins/customSlate";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps,
  CellPluginCustomControlsComonent,
  CellPluginRenderer,
  DataTType,
  ImageUploadType,
} from "@react-page/editor";
import React from "react";
import { AutocompleteMediaInput } from "../../../../Input/AutocompleteMediaInput";
import { Box, Button, Grid } from "../../../../mui";
import { MediaSlider } from "../../../../sliders/MediaSlider";

export interface MediaBlockState extends DataTType {
  media: Media.Media[];
}

export interface MediaBlockSettings {
  imageUpload?: ImageUploadType;
  icon?: React.ReactNode;
}

export const mediaBlockDefaultSettings: MediaBlockSettings = {
  icon: <MediaIcon />,
};

export type ImageControlType = React.ComponentType<
  CellPluginComponentProps<MediaBlockState> & {
    imageUpload?: ImageUploadType;
  }
>;

export const MediaBlockPluginRenderer: CellPluginRenderer<MediaBlockState> = ({
  children,
  remove,
  ...props
}) => {
  const media = props.data?.media ?? [];

  if (media.length > 0) {
    return (
      <Box style={{ maxWidth: 1200, flexGrow: 0 }}>
        <MediaSlider enableDescription={true} data={media} />
      </Box>
    );
  }

  return <div>Select a media...</div>;
};

export const MediaBlockPluginControl: CellPluginCustomControlsComonent<
  MediaBlockState
> = ({ remove, data, ...props }) => {
  const [s, setS] = React.useState<MediaBlockState>({
    media: data.media ?? [],
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.media ? s.media : []),
    [s.media]
  );

  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        padding: 8,
        boxSizing: "border-box",
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12}>
          <AutocompleteMediaInput
            discrete={false}
            selectedItems={selectedItems}
            onChange={(items) => {
              setS({ ...s, media: items });
            }}
          />
        </Grid>

        <Grid item xs={12} sm={12} md={12}>
          <Button
            variant="contained"
            disabled={s.media.length < 1}
            onClick={() => {
              props.onChange(s);
            }}
          >
            Insert
          </Button>
          <Button
            onClick={() => {
              remove?.();
            }}
          >
            Remove
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const createMediaBlockPlugin = (
  settings?: MediaBlockSettings
): CellPlugin<MediaBlockState> => {
  const mergedSettings = { ...mediaBlockDefaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: MediaBlockPluginControl,
    },
    Renderer: MediaBlockPluginRenderer,
    id: MEDIA_BLOCK_PLUGIN,
    version: 1,
    icon: mergedSettings.icon,
    title: "Media Block",
    isInlineable: true,
    description: "Select a media to display",
  };
};

export const MediaBlockPluginIcon = MediaIcon;

export default createMediaBlockPlugin;
