// import ImageIcon from "@mui/icons-material/VideoFileOutlined";
import type {
  CellPlugin,
  CellPluginComponentProps, ImageUploadType
} from "@react-page/editor";
import React from "react";

export type ImageState = {
  src: string;
  href?: string;
  alt?: string;
  openInNewWindow?: boolean;
};

export type ImageSettings = {
  imageUpload?: ImageUploadType;
  // Renderer: CellPluginRenderer<ImageState>;
  // Controls: ImageControlType;
  icon?: React.ReactNode;
};

export const defaultSettings: ImageSettings = {
  // Controls: () => <> Controls for this plugin were not provided</>,
  // Renderer: () => <>Renderer; for this plugin was not provided </>,
  icon: <i />,
};

export type ImageControlType = React.ComponentType<
  CellPluginComponentProps<ImageState> & {
    imageUpload?: ImageUploadType;
  }
>;

const createPlugin = (settings?: ImageSettings): CellPlugin<ImageState> => {
  const mergedSettings = { ...defaultSettings, ...settings };
  const Controls: React.FC<any> = () => {
    return <div>Media control</div>;
  };
  return {
    controls: {
      type: "custom",
      Component: (props) => (
        <Controls {...props} imageUpload={mergedSettings.imageUpload} />
      ),
    },
    Renderer: () => {
      return <div>Image renderer</div>;
    },
    id: "liexp/editor/plugins/mediaBlock",
    version: 1,
    icon: mergedSettings.icon,
    title: "Media Block",
    isInlineable: true,
    description: "Select a media to display",
  };
};
export default createPlugin;
