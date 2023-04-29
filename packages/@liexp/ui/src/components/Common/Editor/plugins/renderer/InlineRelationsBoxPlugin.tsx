import { fp } from "@liexp/core/lib/fp";
import {
  type Keyword,
  type Actor,
  type Group,
} from "@liexp/shared/lib/io/http";
import {
  PARAGRAPH_TYPE,
  isSlatePlugin,
} from "@liexp/shared/lib/slate/plugins/customSlate";
import { type Cell, type Value } from "@react-page/editor";
import { type SlateComponentPluginDefinition } from "@react-page/plugins-slate/lib/types/slatePluginDefinitions";
import { type Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import ActorsBox from "../../../../../containers/ActorsBox";
import { GroupsBox } from "../../../../../containers/GroupsBox";
import { styled } from "../../../../../theme";
import { KeywordsBox } from "../../../../KeywordsBox";
import { Box } from "../../../../mui";
import { transform } from "../../deserialize";
import { ACTOR_INLINE } from "../actor/ActorInline.plugin";
import { GROUP_INLINE } from "../group/GroupInline.plugin";
import { KEYWORD_INLINE } from "../keyword/KeywordInline.plugin";

interface InlineRelation {
  id: string;
  type: "actor" | "group" | "keyword";
}

const deserializePlugin = (
  p: SlateComponentPluginDefinition<any>
): Option<InlineRelation[]> => {
  // console.log(p);
  switch (p.type) {
    case ACTOR_INLINE: {
      const actor = (p as any).data?.actor ?? null;
      // console.log(actor);

      return pipe(
        actor,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "actor" }])
      );
    }
    case GROUP_INLINE: {
      const group = (p as any).data?.group ?? null;
      // console.log(group);

      return pipe(
        group,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "group" }])
      );
    }
    case KEYWORD_INLINE: {
      const keyword = (p as any).data?.keyword ?? null;
      // console.log(keyword);

      return pipe(
        keyword,
        fp.O.fromNullable,
        fp.O.map((a) => [{ id: a.id, type: "keyword" }])
      );
    }
    case PARAGRAPH_TYPE: {
      const children: any[] = (p as any).children ?? [];
      const actors = pipe(
        children.map(deserializePlugin),
        fp.A.compact,
        fp.A.flatten,
        fp.O.fromPredicate((v) => v.length > 0)
      );

      return actors;
    }
    default:
      // eslint-disable-next-line no-console
      // console.log(p);
      return fp.O.none;
  }
};

const deserializeCell = (c: Cell): Option<InlineRelation[]> => {
  if (c.dataI18n?.en?.slate && isSlatePlugin(c)) {
    const plugins: Array<SlateComponentPluginDefinition<any>> = c.dataI18n.en
      .slate as any;

    return pipe(
      plugins.map(deserializePlugin),
      fp.A.sequence(fp.O.Applicative),
      fp.O.map(fp.A.flatten)
    );
  }

  return pipe(
    transform({ rows: c.rows ?? [] } as any, deserializeCell),
    fp.O.fromNullable
  );
};

interface InlineRelations {
  actors: string[];
  groups: string[];
  keywords: string[];
  media: [];
  events: [];
}

export const relationsTransformer = (value: Value): InlineRelations => {
  const relations: InlineRelations = {
    actors: [],
    groups: [],
    keywords: [],
    media: [],
    events: [],
  };
  return pipe(
    transform(value, deserializeCell),
    fp.O.fromNullable,
    fp.O.map(
      fp.A.reduce(relations, (acc, r) => {
        if (r.type === "group") {
          acc.groups.push(r.id);
        } else if (r.type === "actor") {
          acc.actors.push(r.id);
        } else if (r.type === "keyword") {
          acc.keywords.push(r.id);
        }
        return acc;
      })
    ),
    fp.O.getOrElse(
      (): InlineRelations => ({
        groups: [],
        actors: [],
        keywords: [],
        media: [],
        events: [],
      })
    )
  );
};

const PREFIX = `inline-relations-box`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    // position: 'sticky',
    padding: 20,
  },
}));

interface InlineRelationsPluginProps {
  value: Value;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (g: Keyword.Keyword) => void;
}

export const InlineRelationsPlugin: React.FC<InlineRelationsPluginProps> = ({
  value,
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  const { actors, groups, keywords } = React.useMemo(
    () => relationsTransformer(value),
    [value]
  );

  return (
    <StyledBox className={classes.root}>
      <ActorsBox
        params={{ filter: { ids: actors } }}
        onItemClick={onActorClick}
      />
      <GroupsBox
        params={{ filter: { ids: groups } }}
        onItemClick={onGroupClick}
      />
      <KeywordsBox ids={keywords} onItemClick={onKeywordClick} />
    </StyledBox>
  );
};
