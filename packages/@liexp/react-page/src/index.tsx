import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import _background from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import image from "@react-page/plugins-image";
import { SlateCellPlugin } from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
import * as React from "react";
import Editor from "./Editor.js";
import { LiexpEditorProps } from "./EditorProps.js";
import { getLiexpSlate } from "./customSlate.js";
import { LiexpEditor } from "./types.js";
import {
  createExcerptValue,
  getTextContents,
  getTextContentsCapped,
} from "./utils.js";

// exports
export { pluginFactories } from "@react-page/plugins-slate/lib/index.js";

const background = importDefault(_background);

export const LazyEditorComponent = React.lazy(() => import("./Editor.js"));

export const LazyEditor: (
  slate: SlateCellPlugin<any>,
  cellPlugins: any[],
) => React.FC<LiexpEditorProps> =
  // eslint-disable-next-line react/display-name
  (slate: SlateCellPlugin<any>, cellPlugins: any[]) => (props) => {
    return (
      <React.Suspense fallback={<div>Error....</div>}>
        <LazyEditorComponent
          {...props}
          slate={slate}
          cellPlugins={cellPlugins}
        />
      </React.Suspense>
    );
  };

interface EditorFactoryProps {
  custom: any;
  cellPlugins: {
    plain: any[];
    extended: any[];
  };
}

export const createEditor = ({
  custom,
  cellPlugins: _cellPlugins,
}: EditorFactoryProps): LiexpEditor => {
  const liexpSlate = getLiexpSlate(custom);

  const minimalCellPlugins = [liexpSlate] as any[];

  // Define which plugins we want to use.
  const cellPlugins = {
    extended: [
      ...minimalCellPlugins,
      background.default({}),
      image,
      spacer,
      divider,
      video,
      html5Video,
      ..._cellPlugins.extended,
    ],
    plain: [...minimalCellPlugins, ..._cellPlugins.plain] as any[],
  };

  const _createExcerptValue = createExcerptValue(liexpSlate);
  const _getTextContents = getTextContents(liexpSlate);
  const _getTextContentsCapped = getTextContentsCapped(liexpSlate);

  return {
    Editor: ({ variant = "plain", ...props }: LiexpEditorProps) => {
      return (
        <Editor
          {...props}
          slate={liexpSlate}
          cellPlugins={
            variant === "extended" ? cellPlugins.extended : cellPlugins.plain
          }
        />
      );
    },
    LazyEditor: ({ variant = "plain", ...props }) => {
      const LE = LazyEditor(
        liexpSlate,
        variant === "plain" ? cellPlugins.plain : cellPlugins.extended,
      );
      return <LE {...props} />;
    },
    liexpSlate,
    createExcerptValue: _createExcerptValue,
    getTextContents: _getTextContents,
    getTextContentsCapped: _getTextContentsCapped,
  };
};
