import {
  type BlockNoteSchema,
  type BlockSchemaFromSpecs,
  type BlockSpec,
  type defaultBlockSpecs,
  type defaultInlineContentSpecs,
  type defaultStyleSpecs,
  type InlineContentSchemaFromSpecs,
  type InlineContentSpec,
  type StyleSchemaFromSpecs,
} from "@blocknote/core";
import { type EventBlockSpecs } from "./EventBlock.specs.js";
import { type MediaBlockSpecs } from "./MediaBlock.specs.js";
import { type actorInlineSpec } from "./actorInline.specs.js";
import { type AreaInlineSpec } from "./areaInline.specs.js";
import { type GroupInlineSpec } from "./groupInline.specs.js";
import { type KeywordInlineSpec } from "./keywordInline.specs.js";
import { type RelationInlineSpec } from "./relationInline.specs.js";

export type RealBlockNoteSchema = BlockNoteSchema<
  BlockSchemaFromSpecs<
    Omit<typeof defaultBlockSpecs, "image"> & {
      media: BlockSpec<string, MediaBlockSpecs["propSchema"], "inline">;
      event: BlockSpec<string, EventBlockSpecs["propSchema"], "inline">;
    }
  >,
  InlineContentSchemaFromSpecs<
    typeof defaultInlineContentSpecs & {
      keyword: InlineContentSpec<KeywordInlineSpec>;
      area: InlineContentSpec<AreaInlineSpec>;
      relation: InlineContentSpec<RelationInlineSpec>;
      group: InlineContentSpec<GroupInlineSpec>;
      actor: InlineContentSpec<typeof actorInlineSpec>;
    }
  >,
  StyleSchemaFromSpecs<typeof defaultStyleSpecs>
>;

export type BNBlock = RealBlockNoteSchema["Block"];
export type BNESchemaEditor = RealBlockNoteSchema["BlockNoteEditor"];
export type BNEditorDocument =
  RealBlockNoteSchema["BlockNoteEditor"]["document"];
