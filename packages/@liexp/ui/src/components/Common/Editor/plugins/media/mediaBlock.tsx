import type {
  CellPlugin,
  CellPluginComponentProps,
  CellPluginCustomControlsComonent,
  CellPluginRenderer,
  DataTType,
  ImageUploadType,
} from "@liexp/react-page/lib/react-page.types.js";
import { MEDIA_BLOCK_PLUGIN } from "@liexp/react-page/lib/slate/plugins/customSlate.js";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import React from "react";
import { AutocompleteMediaInput } from "../../../../Input/AutocompleteMediaInput.js";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Input,
  Icons,
} from "../../../../mui/index.js";
import { MediaSlider } from "../../../../sliders/MediaSlider.js";

export interface MediaBlockState extends DataTType {
  media: Media.Media[];
  height: number;
  enableDescription: boolean;
}

export interface MediaBlockSettings {
  imageUpload?: ImageUploadType;
  icon?: React.ReactNode;
}

export const mediaBlockDefaultSettings: MediaBlockSettings = {
  icon: <Icons.MediaIcon />,
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
  const height = props.data.height ?? 200;
  const enableDescription = props.data.enableDescription ?? false;

  if (media.length > 0) {
    return (
      <Box style={{ width: "100%", maxWidth: 1400, flexGrow: 0 }}>
        <MediaSlider
          enableDescription={enableDescription}
          disableZoom={false}
          data={media}
          itemStyle={() => ({ height })}
        />
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
    height: data.height ?? 200,
    enableDescription: data.enableDescription ?? false,
  });

  const selectedItems = React.useMemo(
    () => ([] as any[]).concat(s.media ? s.media : []),
    [s.media],
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

        <Grid item xs={6}>
          <Input
            value={s.height}
            onChange={(e) => {
              setS({ ...s, height: +e.currentTarget.value });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                color="info"
                disabled={false}
                size="small"
                checked={s.enableDescription}
                onChange={(v, c) => {
                  setS({
                    ...s,
                    enableDescription: c,
                  });
                }}
              />
            }
            label="Enable description?"
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
  settings?: MediaBlockSettings,
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

export const MediaBlockPluginIcon = Icons.MediaIcon;

export default createMediaBlockPlugin;
