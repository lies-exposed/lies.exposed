import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";

interface BaseInput {
  date: Date;
  draft?: boolean;
  excerpt?: BlockNoteDocument;
  links?: readonly string[];
  media?: readonly string[];
  keywords?: readonly string[];
}

interface BaseEditInput extends Omit<BaseInput, "date"> {
  date?: Date;
}

export const buildCreateCommon = (input: BaseInput) =>
  removeUndefinedFromPayload({
    date: input.date,
    draft: input.draft ?? false,
    excerpt: input.excerpt,
    links: input.links as any[] | undefined,
    media: input.media as any[] | undefined,
    keywords: input.keywords as any[] | undefined,
  });

export const buildEditCommon = (input: BaseEditInput) =>
  removeUndefinedFromPayload({
    date: input.date,
    draft: input.draft,
    excerpt: input.excerpt,
    links: input.links as any[] | undefined,
    media: input.media as any[] | undefined,
    keywords: input.keywords as any[] | undefined,
  });
