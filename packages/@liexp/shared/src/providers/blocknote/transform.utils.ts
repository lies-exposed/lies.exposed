import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type UUID } from "../../io/http/Common/UUID.js";
import { type EventRelationIds } from "../../io/http/Events/index.js";
import { isValidValue } from "./isValidValue.js";
import { type BNESchemaEditor, type BNBlock } from "./type.js";

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
  id: UUID;
  type: "actor" | "group" | "keyword" | "event" | "media" | "area";
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
        // BNBlock can have either content or children depending on the block type
        // We treat both as potential sources of nested blocks
        const nestedItems: unknown[] = [
          ...("content" in p && Array.isArray(p.content) ? p.content : []),
          ...("children" in p &&
          Array.isArray((p as { children?: unknown[] }).children)
            ? (p as { children: unknown[] }).children
            : []),
        ];

        return pipe(
          nestedItems,
          // fp.A.filter((c) => !["text", "link"].includes(c.type)),
          fp.A.map((item) => f(item as BNBlock)),
          fp.A.compact,
          fp.A.flatten,
          (a) => [...a],
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
    case "keyword":
    case "actor":
    case "group":
    case "area":
    case "media":
    case "event": {
      const pp: any = p;
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
      const content = Array.isArray(p.content) ? p.content : [];
      return pipe(
        content,
        fp.A.filter((c) => !["text", "link"].includes(c.type)),
        // Content items that are not text or link are treated as BNBlock for recursion
        fp.A.map((c) =>
          inlineRelationsPluginSerializer(c as unknown as BNBlock),
        ),
        fp.A.compact,
        fp.A.flatten,
        (a) => [...a],
        fp.O.fromPredicate((arr) => arr.length > 0),
      );
    }
  }
};

export interface InlineRelations extends EventRelationIds {
  events: string[];
}

export const relationsTransformer = (
  value: BNESchemaEditor["document"],
): InlineRelations => {
  const relations = {
    actors: [] as UUID[],
    groups: [] as UUID[],
    keywords: [] as UUID[],
    media: [] as UUID[],
    events: [] as UUID[],
    links: [] as UUID[],
    areas: [] as UUID[],
    groupsMembers: [] as UUID[],
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
        } else if (r.type === "area" && !acc.areas.includes(r.id)) {
          acc.areas.push(r.id);
        }
        return acc;
      }),
    ),
    fp.O.getOrElse(() => relations),
  );
};
