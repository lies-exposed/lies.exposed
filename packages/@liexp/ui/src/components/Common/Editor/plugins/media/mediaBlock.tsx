import { Media } from "@liexp/shared/io/http";
import MediaIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps,
  DataTType,
  ImageUploadType,
} from "@react-page/editor";
import React from "react";
import MediaSliderBox from "../../../../../containers/MediaSliderBox";
import { AutocompleteMediaInput } from "../../../../Input/AutocompleteMediaInput";
import { Box } from "../../../../mui";

export interface MediaBlockState extends DataTType {
  mediaId: Media.Media[];
}

export interface MediaBlockSettings {
  imageUpload?: ImageUploadType;
  icon?: React.ReactNode;
}

export const defaultSettings: MediaBlockSettings = {
  icon: <MediaIcon />,
};

export type ImageControlType = React.ComponentType<
  CellPluginComponentProps<MediaBlockState> & {
    imageUpload?: ImageUploadType;
  }
>;

const createMediaBlockPlugin = (
  settings?: MediaBlockSettings
): CellPlugin<MediaBlockState> => {
  const mergedSettings = { ...defaultSettings, ...settings };

  return {
    controls: {
      type: "custom",
      Component: (props) => {
        const selectedItems = props.data?.mediaId ?? [];
        return (
          <Box style={{ height: 200 }}>
            <AutocompleteMediaInput
              {...props}
              selectedItems={selectedItems}
              onChange={(items) => { props.onChange({ mediaId: items }); }}
            />
          </Box>
        );
      },
    },
    Renderer: ({ children, ...props }) => {
      const ids = props.data?.mediaId?.map((v) => v.id) ?? [];
      if (ids.length > 0) {
        return (
          <Box style={{ maxWidth: 1200, flexGrow: 0 }}>
            <MediaSliderBox
              enableDescription={true}
              query={{
                filter: {
                  ids,
                },
                pagination: { perPage: ids.length, page: 1 },
                sort: { field: "createdAt", order: "DESC" },
              }}
            />
          </Box>
        );
      }

      return <div>Select a media...</div>;
    },
    id: "liexp/editor/plugins/mediaBlock",
    version: 1,
    icon: mergedSettings.icon,
    title: "Media Block",
    isInlineable: true,
    description: "Select a media to display",
  };
};
export default createMediaBlockPlugin;
