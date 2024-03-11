import { SlateCellPlugin } from "@react-page/plugins-slate";
import * as React from "react";
import Editor from "./Editor.js";
import { LiexpEditorProps } from "./EditorProps.js";
import {
  createExcerptValue,
  getLiexpSlate,
  getTextContents,
  getTextContentsCapped,
} from "./slate/index.js";
import { Value } from "./types.js";

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

export interface LiexpEditor {
  Editor: React.FC<LiexpEditorProps>;
  LazyEditor: React.FC<LiexpEditorProps>;
  liexpSlate: SlateCellPlugin<any>;
  createExcerptValue: (text: string) => Value;
  getTextContents: (v: Value, j?: string) => string;
  getTextContentsCapped: (v: Value, end: number) => string;
}

export const createEditor = ({
  custom,
  cellPlugins: _cellPlugins,
}: EditorFactoryProps): LiexpEditor => {
  const liexpSlate = getLiexpSlate({
    // actorInlinePlugin,
    // groupInlinePlugin,
    // keywordInlinePlugin,
    // linkInlinePlugin,
    // componentPickerPopoverPlugin,
  });

  const minimalCellPlugins = [liexpSlate] as any[];

  // Define which plugins we want to use.
  const cellPlugins = {
    extended: [...minimalCellPlugins, _cellPlugins],
    plain: [
      ...minimalCellPlugins,
      // background,
      // image,
      // spacer,
      // divider,
      // video,
      // html5Video,
      // gridCellPlugin,
      // mediaBlock({}),
      // eventsBlock({}),
    ] as any[],
  };

  const _createExcerptValue = createExcerptValue(liexpSlate);
  const _getTextContents = getTextContents(liexpSlate);
  const _getTextContentsCapped = getTextContentsCapped(liexpSlate);

  return {
    Editor: ({ variant = "plain", ...props }: LiexpEditorProps) => (
      <Editor
        {...props}
        slate={liexpSlate}
        cellPlugins={
          variant === "extended" ? cellPlugins.extended : cellPlugins.plain
        }
      />
    ),
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
