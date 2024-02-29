import { createEditor } from "@liexp/react-page/lib/index.js";
import { componentPickerPopoverPlugin } from "./plugins/ComponentPickerPopover/index.js";
import { actorInlinePlugin } from "./plugins/actor/ActorInline.plugin.js";
import eventsBlock from "./plugins/event/eventBlock.plugin.js";
import gridCellPlugin from "./plugins/gridCellPlugin.js";
import { groupInlinePlugin } from "./plugins/group/GroupInline.plugin.js";
import { keywordInlinePlugin } from "./plugins/keyword/KeywordInline.plugin.js";
import { linkInlinePlugin } from "./plugins/links/LinkInline.plugin.js";
import mediaBlock from "./plugins/media/mediaBlock.js";

const editor = createEditor({
  cellPlugins: {
    plain: [],
    extended: [gridCellPlugin, mediaBlock({}), eventsBlock({})],
  },
  custom: {
    actorInlinePlugin,
    groupInlinePlugin,
    keywordInlinePlugin,
    linkInlinePlugin,
    componentPickerPopoverPlugin,
  },
});

export { editor };
