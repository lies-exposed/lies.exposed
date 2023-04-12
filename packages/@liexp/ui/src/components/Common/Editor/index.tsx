// import { customSlate } from "@liexp/shared/lib/slate";
import { getLiexpSlate } from "@liexp/shared/lib/slate";
import RPEditor, { type EditorProps, type Value } from "@react-page/editor";
import background from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import image from "@react-page/plugins-image";
// import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
import * as React from "react";
// import { actorInlinePlugin } from "./plugins/actor/ActorInline";
import eventsBlock from "./plugins/event/eventBlock.plugin";
import gridCellPlugin from "./plugins/gridCellPlugin";
import mediaBlock from "./plugins/media/mediaBlock";

export const minimalCellPlugins = [
  getLiexpSlate({
    // actorInlinePlugin,
  }),
] as any[];

// Define which plugins we want to use.
export const cellPlugins = [
  ...minimalCellPlugins,
  background({}),
  image,
  spacer,
  divider,
  video,
  html5Video,
  gridCellPlugin,
  mediaBlock({}),
  eventsBlock({}),
] as any[];

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = ({
  value: initialValue,
  ...props
}) => {
  const [value, setValue] = React.useState<Value | null>(initialValue as any);

  return (
    <RPEditor
      cellPlugins={cellPlugins}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
};

export default Editor;
