export const H1_TYPE = "HEADINGS/HEADING-ONE";
export const H2_TYPE = "HEADINGS/HEADING-TWO";
export const H3_TYPE = "HEADINGS/HEADING-THREE";
export const H4_TYPE = "HEADINGS/HEADING-FOUR";
export const H5_TYPE = "HEADINGS/HEADING-FIVE";
export const H6_TYPE = "HEADINGS/HEADING-SIX";
export const PARAGRAPH_TYPE = "PARAGRAPH/PARAGRAPH";
export const PARAGRAPH_PRE_TYPE = "PARAGRAPH/PRE";
export const EMPHASIZE_EM_TYPE = "EMPHASIZE/EM";
export const EMPHASIZE_STRONG_TYPE = "EMPHASIZE/STRONG";
export const EMPHASIZE_U_TYPE = "EMPHASIZE/U";
export const BLOCKQUOTE_TYPE = "BLOCKQUOTE/BLOCKQUOTE";

export const LIEXP_SLATE_PLUGIN_ID = "eco-slate-plugin";
export const LINK_INLINE = "liexp/link/inline";
export const ACTOR_INLINE = "liexp/actor/inline";
export const AREA_INLINE = "liexp/area/inline";
export const GROUP_INLINE = "liexp/group/inline";
export const KEYWORD_INLINE = "liexp/keyword/inline";
export const MEDIA_BLOCK_PLUGIN = "liexp/editor/plugins/mediaBlock";
export const EVENT_BLOCK_PLUGIN = "liexp/editor/plugins/EventBlock";
export const COMPONENT_PICKER_POPOVER_PLUGIN =
  "liexp/plugin/component-picker-popover";

export const isSlatePlugin = (c: any): boolean => {
  return c.plugin?.id === LIEXP_SLATE_PLUGIN_ID;
};

export const isMediaBlockCell = (c: any): boolean => {
  return c.plugin?.id === MEDIA_BLOCK_PLUGIN;
};

export const isEventBlockCell = (c: any): boolean => {
  return c.plugin?.id === EVENT_BLOCK_PLUGIN;
};
