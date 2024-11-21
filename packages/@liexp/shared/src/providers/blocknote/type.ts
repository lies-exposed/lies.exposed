import {
  type defaultStyleSpecs,
  type BlockNoteSchema,
  type BlockSchema,
  type BlockSchemaFromSpecs,
  type BlockSpec,
  type InlineContentSchema,
  type InlineContentSchemaFromSpecs,
  type InlineContentSpec,
  type StyleSchema,
  type StyleSchemaFromSpecs,
  type defaultBlockSpecs,
  type defaultInlineContentSpecs,
} from "@blocknote/core";
import { type EventBlockSpecs } from "./EventBlock.specs";
import { type MediaBlockSpecs } from "./MediaBlock.specs";
import { type actorInlineSpec } from "./actorInline.specs";
import { type AreaInlineSpec } from "./areaInline.specs";
import { type GroupInlineSpec } from "./groupInline.specs";
import { type KeywordInlineSpec } from "./keywordInline.specs";
import { type RelationInlineSpec } from "./relationInline.specs";

export type RealBlockNoteSchema = BlockNoteSchema<
  BlockSchemaFromSpecs<
    Omit<typeof defaultBlockSpecs, "image"> & {
      media: BlockSpec<
        MediaBlockSpecs,
        BlockSchema,
        InlineContentSchema,
        StyleSchema
      >;
      event: BlockSpec<
        EventBlockSpecs,
        BlockSchema,
        InlineContentSchema,
        StyleSchema
      >;
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
