import { getLiexpSlate } from "@liexp/shared/lib/slate/index.js";
import background from "@react-page/plugins-background/lib-es/index.js";
import divider from "@react-page/plugins-divider/lib-es/index.js";
import html5Video from "@react-page/plugins-html5-video/lib-es/index.js";
import image from "@react-page/plugins-image/lib-es/index.js";
import spacer from "@react-page/plugins-spacer/lib-es/index.js";
import video from "@react-page/plugins-video/lib-es/index.js";
import { componentPickerPopoverPlugin } from "./plugins/ComponentPickerPopover/index.js";
import { actorInlinePlugin } from "./plugins/actor/ActorInline.plugin.js";
import eventsBlock from "./plugins/event/eventBlock.plugin.js";
import gridCellPlugin from "./plugins/gridCellPlugin.js";
import { groupInlinePlugin } from "./plugins/group/GroupInline.plugin.js";
import { keywordInlinePlugin } from "./plugins/keyword/KeywordInline.plugin.js";
import { linkInlinePlugin } from "./plugins/links/LinkInline.plugin.js";
import mediaBlock from "./plugins/media/mediaBlock.js";

export const minimalCellPlugins = [
  getLiexpSlate({
    actorInlinePlugin,
    groupInlinePlugin,
    keywordInlinePlugin,
    linkInlinePlugin,
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
