import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from "@blocknote/core";
import { eventBlock } from "./plugins/block/EventBlock.plugin.js";
import { mediaBlock } from "./plugins/block/MediaBlock.plugin.js";
import { actorInlineContentSpec } from "./plugins/inline/ActorInlineBlockNote.plugin.js";
import { groupInlineContentSpec } from "./plugins/inline/GroupInlineBlockNote.plugin.js";
import { keywordInlineContentSpec } from "./plugins/inline/KeywordInlineBlockNote.plugin.js";
import { relationInlineContentSpec } from "./plugins/inline/RelationInlineBlockNote.plugin.js";

const { image, ...otherBlockSpecs } = defaultBlockSpecs;
// Our schema with inline content specs, which contain the configs and
// implementations for inline content  that we want our editor to use.

export const schema = BlockNoteSchema.create({
  inlineContentSpecs: {
    // Adds all default inline content.
    ...defaultInlineContentSpecs,
    actor: actorInlineContentSpec,
    group: groupInlineContentSpec,
    keyword: keywordInlineContentSpec,
    relation: relationInlineContentSpec,
  },
  blockSpecs: {
    ...otherBlockSpecs,
    media: mediaBlock,
    event: eventBlock,
  },
});

export type BNSchema = typeof schema;
export type BNESchemaEditor = typeof schema.BlockNoteEditor;
export type BNBlock = (typeof schema.BlockNoteEditor.document)[0];
