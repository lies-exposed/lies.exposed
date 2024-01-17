import {
  type ACTOR_INLINE,
  type EVENT_BLOCK_PLUGIN,
  type GROUP_INLINE,
  type KEYWORD_INLINE,
  type LINK_INLINE,
  type MEDIA_BLOCK_PLUGIN,
} from "@liexp/shared/lib/slate/plugins/customSlate.js";
// eslint-disable-next-line no-restricted-imports
import { type OverridableComponent } from "@mui/material/OverridableComponent";
import { type DataTType } from "@react-page/editor";
import { type ActorInlineState } from "../actor/ActorInline.plugin.js";
import { type EventBlockState } from "../event/eventBlock.plugin.js";
import { type GroupInlineState } from "../group/GroupInline.plugin.js";
import { type KeywordInlineState } from "../keyword/KeywordInline.plugin.js";
import { type LinkInlineState } from "../links/LinkInline.plugin.js";
import { type MediaBlockState } from "../media/mediaBlock.js";

export type PickablePlugin = {
  icon: OverridableComponent<any>;
  name: string;
} & (
  | {
      type: typeof ACTOR_INLINE;
      data?: ActorInlineState;
    }
  | {
      type: typeof GROUP_INLINE;
      data?: GroupInlineState;
    }
  | {
      type: typeof KEYWORD_INLINE;
      data?: KeywordInlineState;
    }
  | {
      type: typeof MEDIA_BLOCK_PLUGIN;
      data?: MediaBlockState;
    }
  | {
      type: typeof EVENT_BLOCK_PLUGIN;
      data?: EventBlockState;
    }
  | {
      type: typeof LINK_INLINE;
      data?: LinkInlineState;
    }
) &
  DataTType;

export interface ComponentPickerPopoverState extends DataTType {
  plugin: PickablePlugin;
}
