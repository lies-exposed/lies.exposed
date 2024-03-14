import {
  ACTOR_INLINE,
  AREA_INLINE,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  KEYWORD_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/react-page/lib/customSlate.js";
import { ActorInlinePluginIcon } from "../../actor/ActorInline.plugin.js";
import { AreaInlinePluginIcon } from "../../area/AreaInline.plugin.js";
import { EventBlockPluginIcon } from "../../event/eventBlock.plugin.js";
import { GroupInlinePluginIcon } from "../../group/GroupInline.plugin.js";
import { KeywordInlinePluginIcon } from "../../keyword/KeywordInline.plugin.js";
import { MediaBlockPluginIcon } from "../../media/mediaBlock.js";

export const PLUGINS = [
  { name: "Actor", type: ACTOR_INLINE, icon: ActorInlinePluginIcon },
  { name: "Area", type: AREA_INLINE, icon: AreaInlinePluginIcon },
  { name: "Group", type: GROUP_INLINE, icon: GroupInlinePluginIcon },
  { name: "Keyword", type: KEYWORD_INLINE, icon: KeywordInlinePluginIcon },
  {
    name: "Media",
    type: MEDIA_BLOCK_PLUGIN,
    icon: MediaBlockPluginIcon,
  },
  { name: "Event", type: EVENT_BLOCK_PLUGIN, icon: EventBlockPluginIcon },
];
