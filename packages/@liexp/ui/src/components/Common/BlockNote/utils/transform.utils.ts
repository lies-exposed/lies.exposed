import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Option } from "fp-ts/lib/Option.js";
import { BNESchemaEditor } from "../EditorSchema.js";
import { isValidValue } from "./isValidValue.js";

export interface BNBlock {
  type: string;
  props?: any;
  content: any[];
}

export type DeserializeBNBlock<T> = (p: BNBlock) => Option<T[]>;

export function transform<T>(
  v: BNESchemaEditor["document"],
  f: DeserializeBNBlock<T>,
): T[] | null {
  if (!isValidValue(v)) {
    return null;
  }

  return pipe(
    v as BNBlock[],
    fp.A.reduce([] as T[], (acc, block) => {
      const result = blockSerializer(f)(block);
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
          p.content,
          fp.A.filter((c) => !["text", "link"].includes(c.type)),
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
    case "keyword":
    case "actor":
    case "group": {
      return pipe(
        p.props?.id,
        fp.O.fromNullable,
        fp.O.map((id) => [{ id, type: p.type as InlineRelation["type"] }]),
      );
    }
    // case EVENT_BLOCK_PLUGIN: {
    //   const events: any[] = (p as any).data?.events ?? [];
    //   return pipe(
    //     events,
    //     fp.O.fromPredicate((arr) => arr.length > 0),
    //     fp.O.map(fp.A.map((ev) => ({ id: ev.id, type: "event" }))),
    //   );
    // }
    // case MEDIA_BLOCK_PLUGIN: {
    //   const media: any[] = (p as any).data?.media ?? [];
    //   return pipe(
    //     media,
    //     fp.O.fromPredicate((arr) => arr.length > 0),
    //     fp.O.map(fp.A.map((m) => ({ id: m.id, type: "media" }))),
    //   );
    // }
    case "numberedListItem":
    case "bulletListItem":
    case "table": {
      return fp.O.none;
    }
    default: {
      return pipe(
        p.content,
        fp.A.filter((c) => !["text", "link"].includes(c.type)),
        fp.A.map((c) => inlineRelationsPluginSerializer(c)),
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
