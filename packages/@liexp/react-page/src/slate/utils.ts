import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type Row,
  type Cell,
  type Value,
} from "@react-page/editor/lib/core/types/index.js";
import { createValue } from "@react-page/editor/lib/core/utils/createValue.js";
import { getTextContents as defaultGetTextContents } from "@react-page/editor/lib/core/utils/getTextContents.js";
import { SlateCellPlugin } from "@react-page/plugins-slate";
import { pluginFactories } from "@react-page/plugins-slate/lib/index.js";
import { type SlateComponentPluginDefinition } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  PARAGRAPH_TYPE,
  isSlatePlugin,
  KEYWORD_INLINE,
  GROUP_INLINE,
  ACTOR_INLINE,
  COMPONENT_PICKER_POPOVER_PLUGIN,
  EVENT_BLOCK_PLUGIN,
  MEDIA_BLOCK_PLUGIN,
  isMediaBlockCell,
  isEventBlockCell,
} from "./plugins/customSlate.js";

export { pluginFactories };

export const getTextContents =
  (slate: SlateCellPlugin<any>) =>
  (v: Value, j?: string): string => {
    return defaultGetTextContents(v, {
      lang: "en",
      cellPlugins: [slate],
    }).join(j ?? "\n");
  };

export const getTextContentsCapped =
  (slate: SlateCellPlugin<any>) =>
  (v: Value | undefined, end: number): string => {
    if (v) {
      const contents = getTextContents(slate)(v).substring(0, end);

      return contents;
    }
    return "";
  };

export const isValidValue = (v?: any): v is Value => {
  const valid =
    !!v && !!v.version && Array.isArray(v.rows) && v?.rows?.length > 0;

  return valid;
};

export const createExcerptValue =
  (slate: SlateCellPlugin<any>) =>
  (text: string): Value => {
    return createValue(
      {
        rows: [
          [
            {
              id: slate.id,
              plugin: slate.id,
              data: slate.createData((def) => ({
                children: [
                  {
                    plugin: def.plugins.paragraphs.paragraph,
                    children: [text],
                  },
                ],
              })),
            },
          ],
        ],
      },
      {
        lang: "en",
        cellPlugins: [slate as any],
      },
    );
  };

const deserializeRow =
  <T>(f: (c: Cell) => Option<T[]>) =>
  (r: Row): T[] => {
    const cells = pipe(r.cells, fp.A.map(f));
    return pipe(cells, fp.A.compact, fp.A.flatten);
  };

export function transform<T>(
  v: { rows: Row[] },
  f: (c: Cell) => Option<T[]>,
): T[] | null {
  if (v.rows.length === 0) {
    return null;
  }

  return pipe(v.rows, fp.A.map(deserializeRow(f)), fp.A.flatten);
}

interface InlineRelation {
  id: string;
  type: "actor" | "group" | "keyword" | "event" | "media";
}

const deserializePlugin = (
  p: SlateComponentPluginDefinition<any>,
): Option<InlineRelation[]> => {
  // console.log(p.type, p);
  switch (p.type) {
    case ACTOR_INLINE: {
      const actor = (p as any).data?.actor ?? null;
      // console.log(actor);

      return pipe(
        actor,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "actor" }]),
      );
    }
    case GROUP_INLINE: {
      const group = (p as any).data?.group ?? null;
      // console.log(group);

      return pipe(
        group,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "group" }]),
      );
    }
    case KEYWORD_INLINE: {
      const keyword = (p as any).data?.keyword ?? null;
      // console.log(keyword);

      return pipe(
        keyword,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "keyword" }]),
      );
    }
    case EVENT_BLOCK_PLUGIN: {
      const events: any[] = (p as any).data?.events ?? [];
      return pipe(
        events,
        fp.O.fromPredicate((arr) => arr.length > 0),
        fp.O.map(fp.A.map((ev) => ({ id: ev.id, type: "event" }))),
      );
    }
    case MEDIA_BLOCK_PLUGIN: {
      const media: any[] = (p as any).data?.media ?? [];
      return pipe(
        media,
        fp.O.fromPredicate((arr) => arr.length > 0),
        fp.O.map(fp.A.map((m) => ({ id: m.id, type: "media" }))),
      );
    }
    case COMPONENT_PICKER_POPOVER_PLUGIN: {
      return pipe(
        (p as any).data?.plugin,
        fp.O.fromNullable,
        fp.O.chain(deserializePlugin),
      );
    }

    case PARAGRAPH_TYPE:
    default: {
      const children: any[] = (p as any).children ?? [];
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

const deserializeCell = (c: Cell): Option<InlineRelation[]> => {
  // console.log("cell", c);
  if (c.dataI18n?.en?.slate) {
    if (isSlatePlugin(c)) {
      // console.log("is slate plugin");
      const plugins: SlateComponentPluginDefinition<any>[] = c.dataI18n.en
        .slate as any;

      return pipe(
        plugins.map((p) =>
          pipe(
            deserializePlugin(p),
            fp.O.getOrElse((): InlineRelation[] => []),
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
      data: c.dataI18n?.en as any,
    } as any);
  }

  // console.log("not a slate plugin");
  return pipe(
    transform({ rows: c.rows ?? [] }, deserializeCell),
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

export const relationsTransformer = (value: Value): InlineRelations => {
  const relations: InlineRelations = {
    actors: [],
    groups: [],
    keywords: [],
    media: [],
    events: [],
    links: [],
  };

  return pipe(
    transform(value, deserializeCell),
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
