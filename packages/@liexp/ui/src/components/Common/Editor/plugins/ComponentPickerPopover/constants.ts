import {
  ACTOR_INLINE,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  KEYWORD_INLINE,
  MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { ActorInlinePluginIcon } from "../actor/ActorInline.plugin";
import { EventBlockPluginIcon } from "../event/eventBlock.plugin";
import { GroupInlinePluginIcon } from "../group/GroupInline.plugin";
import { KeywordInlinePluginIcon } from "../keyword/KeywordInline.plugin";
import { MediaBlockPluginIcon } from "../media/mediaBlock";

export const ANCHOR_ID = "component-picker-popover-anchor";

export const PLUGINS = [
  { name: "Actor", type: ACTOR_INLINE, icon: ActorInlinePluginIcon },
  { name: "Group", type: GROUP_INLINE, icon: GroupInlinePluginIcon },
  { name: "Keyword", type: KEYWORD_INLINE, icon: KeywordInlinePluginIcon },
  {
    name: "Media",
    type: MEDIA_BLOCK_PLUGIN,
    icon: MediaBlockPluginIcon,
  },
  { name: "Event", type: EVENT_BLOCK_PLUGIN, icon: EventBlockPluginIcon },
];
