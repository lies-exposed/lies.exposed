import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import { getLiexpSlate } from "@liexp/shared/lib/slate/index.js";
import background from "@react-page/plugins-background";
import divider from "@react-page/plugins-divider";
import html5Video from "@react-page/plugins-html5-video";
import image from "@react-page/plugins-image";
import spacer from "@react-page/plugins-spacer";
import video from "@react-page/plugins-video";
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
  importDefault(background).default({}),
  image,
  spacer,
  divider,
  video,
  html5Video,
  gridCellPlugin,
  mediaBlock({}),
  eventsBlock({}),
] as any[];
