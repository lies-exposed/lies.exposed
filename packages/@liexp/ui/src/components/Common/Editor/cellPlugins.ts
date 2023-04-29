import { getLiexpSlate } from "@liexp/shared/lib/slate";
import background from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import image from "@react-page/plugins-image";
// import slate from "@react-page/plugins-slate";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
import { componentPickerPopoverPlugin } from "./plugins/ComponentPickerPopoverPlugin";
import { actorInlinePlugin } from "./plugins/actor/ActorInline.plugin";
import eventsBlock from "./plugins/event/eventBlock.plugin";
import gridCellPlugin from "./plugins/gridCellPlugin";
import { groupInlinePlugin } from "./plugins/group/GroupInline.plugin";
import { keywordInlinePlugin } from "./plugins/keyword/KeywordInline.plugin";
import mediaBlock from "./plugins/media/mediaBlock";

export const minimalCellPlugins = [
  getLiexpSlate({
    actorInlinePlugin,
    groupInlinePlugin,
    keywordInlinePlugin,
    componentPickerPopoverPlugin,
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
