import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { splitUUIDs } from "../../args.js";

interface BaseInput {
  date: Date;
  draft?: boolean;
  excerpt?: string;
  links?: string;
  media?: string;
  keywords?: string;
}

interface BaseEditInput extends Omit<BaseInput, "date"> {
  date?: Date;
}

export const buildCreateCommon = (input: BaseInput) =>
  removeUndefinedFromPayload({
    date: input.date,
    draft: input.draft ?? false,
    excerpt: input.excerpt,
    links:
      input.links !== undefined
        ? (splitUUIDs(input.links) as any[])
        : undefined,
    media:
      input.media !== undefined
        ? (splitUUIDs(input.media) as any[])
        : undefined,
    keywords:
      input.keywords !== undefined
        ? (splitUUIDs(input.keywords) as any[])
        : undefined,
  });

export const buildEditCommon = (input: BaseEditInput) =>
  removeUndefinedFromPayload({
    date: input.date,
    draft: input.draft,
    excerpt: input.excerpt,
    links:
      input.links !== undefined
        ? (splitUUIDs(input.links) as any[])
        : undefined,
    media:
      input.media !== undefined
        ? (splitUUIDs(input.media) as any[])
        : undefined,
    keywords:
      input.keywords !== undefined
        ? (splitUUIDs(input.keywords) as any[])
        : undefined,
  });
