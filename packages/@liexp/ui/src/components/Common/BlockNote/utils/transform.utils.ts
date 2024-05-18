import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Option } from "fp-ts/lib/Option.js";
import { BNBlock, BNESchemaEditor } from "../EditorSchema.js";
import { isValidValue } from "./isValidValue.js";

export type DeserializeBNBlock<T> = (p: BNBlock) => Option<T[]>;

export function transform<T>(
  v: BNESchemaEditor["document"],
  f: DeserializeBNBlock<T>,
): T[] | null {
  if (!isValidValue(v)) {
    return null;
  }

  const blockTransformer = blockSerializer(f);

  return pipe(
    v as BNBlock[],
    fp.A.reduce([] as T[], (acc, block) => {
      const result = blockTransformer(block);
      return acc.concat(...result);
    }),
  );
}

interface InlineRelation {
  id: string;
  type: "actor" | "group" | "keyword" | "event" | "media";
}

const blockSerializer =
  <T>(f: DeserializeBNBlock<T>) =>
  (p: BNBlock): T[] => {
    switch (p.type) {
      case "numberedListItem":
      case "bulletListItem":
      case "table": {
        return [];
      }
      case "paragraph": {
        return pipe(
          [...(p?.content ?? []), ...((p as any)?.children ?? [])],
          // fp.A.filter((c) => !["text", "link"].includes(c.type)),
          fp.A.map(f),
          fp.A.compact,
          fp.A.flatten,
        );
      }
      default: {
        return pipe(
          f(p),
          fp.O.getOrElse((): T[] => []),
        );
      }
    }
  };

const inlineRelationsPluginSerializer = (
  p: BNBlock,
): Option<InlineRelation[]> => {
  switch (p.type) {
    case "keyword" as any:
    case "actor" as any:
    case "group" as any:
    case "media":
    case "event": {
      const pp = p as any;
      return pipe(
        pp.props?.id,
        fp.O.fromNullable,
        fp.O.map((id) => [{ id, type: p.type as InlineRelation["type"] }]),
      );
    }
    case "numberedListItem":
    case "bulletListItem":
    case "table": {
      return fp.O.none;
    }
    default: {
      return pipe(
        p.content,
        fp.A.filter((c) => !["text", "link"].includes(c.type)),
        fp.A.map((c) => inlineRelationsPluginSerializer(c as any)),
        fp.A.compact,
        fp.A.flatten,
        fp.O.fromPredicate((arr) => arr.length > 0),
      );
    }
  }
};

export interface InlineRelations {
  actors: string[];
  groups: string[];
  keywords: string[];
  media: string[];
  events: string[];
  links: string[];
}

export const relationsTransformer = (
  value: BNESchemaEditor["document"],
): InlineRelations => {
  const relations: InlineRelations = {
    actors: [],
    groups: [],
    keywords: [],
    media: [],
    events: [],
    links: [],
  };

  return pipe(
    transform(value, inlineRelationsPluginSerializer),
    fp.O.fromNullable,
    fp.O.map(
      fp.A.reduce(relations, (acc, r) => {
        if (r.type === "group" && !acc.groups.includes(r.id)) {
          acc.groups.push(r.id);
        } else if (r.type === "actor" && !acc.actors.includes(r.id)) {
          acc.actors.push(r.id);
        } else if (r.type === "keyword" && !acc.keywords.includes(r.id)) {
          acc.keywords.push(r.id);
        } else if (r.type === "media" && !acc.media.includes(r.id)) {
          acc.media.push(r.id);
        } else if (r.type === "event" && !acc.events.includes(r.id)) {
          acc.events.push(r.id);
        }
        return acc;
      }),
    ),
    fp.O.getOrElse(() => relations),
  );
};
