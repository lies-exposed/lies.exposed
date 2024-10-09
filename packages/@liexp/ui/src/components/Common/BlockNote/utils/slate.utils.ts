import { fp } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  ACTOR_INLINE,
  COMPONENT_PICKER_POPOVER_PLUGIN,
  EVENT_BLOCK_PLUGIN,
  GROUP_INLINE,
  KEYWORD_INLINE,
  MEDIA_BLOCK_PLUGIN,
  PARAGRAPH_TYPE,
  isEventBlockCell,
  isMediaBlockCell,
  isSlatePlugin,
} from "./customSlate.js";

export interface SlateValue {
  id: string;
  rows: any[];
  version: number;
}

export const isValidSlateValue = (v?: any): v is SlateValue => {
  const valid =
    (!!v && !!v.version && Array.isArray(v.rows) && v?.rows?.length > 0) ||
    // empty object is a valid slate value
    JSON.stringify(v) === "{}";

  return valid;
};

const deserializeRow =
  <T>(f: (c: any) => Option<T[]>) =>
  (r: any): T[] => {
    const cells = pipe(r.cells, fp.A.map(f));
    return pipe(cells, fp.A.compact, fp.A.flatten);
  };

export function transform<T>(
  v: { rows: any[] },
  f: DeserializeSlatePluginFN<T>,
): T[] | null {
  if (!v.rows?.length) {
    return null;
  }

  return pipe(
    v.rows,
    fp.A.map(deserializeRow((c) => deserializeCell(f)(c))),
    fp.A.flatten,
    fp.O.fromPredicate(fp.A.isNonEmpty),
    fp.O.toNullable,
  );
}

interface InlineRelation {
  id: string;
  type: "actor" | "group" | "keyword" | "event" | "media";
}
export type DeserializeSlatePluginFN<T> = (p: any) => Option<T[]>;

const deserializePlugin: DeserializeSlatePluginFN<InlineRelation> = (p) => {
  // console.log(p.type, p);
  switch (p.type) {
    case ACTOR_INLINE: {
      const actor = p.data?.actor ?? null;
      // console.log(actor);

      return pipe(
        actor,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "actor" }]),
      );
    }
    case GROUP_INLINE: {
      const group = p.data?.group ?? null;
      // console.log(group);

      return pipe(
        group,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "group" }]),
      );
    }
    case KEYWORD_INLINE: {
      const keyword = p.data?.keyword ?? null;
      // console.log(keyword);

      return pipe(
        keyword,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "keyword" }]),
      );
    }
    case EVENT_BLOCK_PLUGIN: {
      const events: any[] = p.data?.events ?? [];
      return pipe(
        events,
        fp.O.fromPredicate((arr) => arr.length > 0),
        fp.O.map(fp.A.map((ev) => ({ id: ev.id, type: "event" }))),
      );
    }
    case MEDIA_BLOCK_PLUGIN: {
      const media: any[] = p.data?.media ?? [];
      return pipe(
        media,
        fp.O.fromPredicate((arr) => arr.length > 0),
        fp.O.map(fp.A.map((m) => ({ id: m.id, type: "media" }))),
      );
    }
    case COMPONENT_PICKER_POPOVER_PLUGIN: {
      return pipe(
        p.data?.plugin,
        fp.O.fromNullable,
        fp.O.chain(deserializePlugin),
      );
    }

    case PARAGRAPH_TYPE:
    default: {
      const children: any[] = p.children ?? [];
      const relations = pipe(
        children.map(deserializePlugin),
        fp.A.compact,
        fp.A.flatten,
        fp.O.fromPredicate((v) => v.length > 0),
      );

      return relations;
    }
  }
};

const deserializeCell =
  <T>(deserializePlugin: DeserializeSlatePluginFN<T>) =>
  (c: any): Option<T[]> => {
    // console.log("cell", c);
    if (c.dataI18n?.en?.slate) {
      if (isSlatePlugin(c)) {
        // console.log("is slate plugin");
        const plugins: any[] = c.dataI18n.en.slate;

        return pipe(
          plugins.map((p) =>
            pipe(
              deserializePlugin(p),
              fp.O.getOrElse((): T[] => []),
            ),
          ),
          // fp.A.traverse(fp.O.Applicative)((e) => {
          //  const plug = deserializePlugin(e)
          //  console.log('plug', plug);
          //  return plug;
          // }),
          // (relations) => {
          //   console.log({ relations });
          //   return relations;
          // },
          fp.A.flatten,
          fp.O.fromPredicate((arr) => arr.length > 0),
        );
      }
    }

    if (isMediaBlockCell(c) || isEventBlockCell(c)) {
      return deserializePlugin({
        ...c.plugin,
        type: c.plugin?.id,
        data: c.dataI18n?.en,
      });
    }

    // console.log("not a slate plugin");
    return pipe(
      transform({ rows: c.rows ?? [] }, deserializePlugin),
      fp.O.fromNullable,
    );
  };

export interface InlineRelations {
  actors: string[];
  groups: string[];
  keywords: string[];
  media: string[];
  events: string[];
  links: string[];
}

export const relationsTransformer = (value: SlateValue): InlineRelations => {
  const relations: InlineRelations = {
    actors: [],
    groups: [],
    keywords: [],
    media: [],
    events: [],
    links: [],
  };

  return pipe(
    transform(value, deserializePlugin),
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
