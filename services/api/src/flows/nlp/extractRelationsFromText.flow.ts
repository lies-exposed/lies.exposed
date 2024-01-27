import path from "path";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type AreaEntity } from "#entities/Area.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { type GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

export const extractRelationsFromText: TEFlow<
  [string],
  {
    entities: {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      links: LinkEntity[];
      areas: AreaEntity[];
      groupsMembers: GroupMemberEntity[];
      media: MediaEntity[];
    };
    sentences: Array<{text: string; importance: number}>;
  }
> = (ctx) => (text) => {
  const nerProvider = GetNERProvider(ctx);

  return pipe(
    sequenceS(TE.ApplicativeSeq)({
      entities: pipe(
        ctx.fs.getObject(
          path.resolve(ctx.config.dirs.cwd, nerProvider.entitiesFile),
        ),
        TE.map(JSON.parse),
      ),
    }),
    TE.chain(({ entities }) => {
      return pipe(
        nerProvider.process(text, entities),
        TE.chain(({ entities: details, sentences }) =>
          pipe(
            sequenceS(TE.ApplicativePar)({
              actors: pipe(
                details
                  .filter((d) => d.type === "actor")
                  .reduce<
                    string[]
                  >((acc, a) => (acc.includes(a.value) ? acc : acc.concat(a.value)), []),
                O.fromPredicate((ll) => ll.length > 0),
                O.map((names) =>
                  ctx.db.find(ActorEntity, {
                    select: ["id", "fullName", "avatar"],
                    where: {
                      fullName: In(names),
                    },
                  }),
                ),
                O.getOrElse(() => TE.right<ControllerError, ActorEntity[]>([])),
              ),
              groups: pipe(
                details
                  .filter((d) => d.type === "group")
                  .reduce<
                    string[]
                  >((acc, a) => (acc.includes(a.value) ? acc : acc.concat(a.value)), []),
                O.fromPredicate((l) => l.length > 0),
                O.map((names) =>
                  ctx.db.find(GroupEntity, {
                    select: ["id", "name", "avatar"],
                    where: {
                      name: In(names),
                    },
                  }),
                ),
                O.getOrElse(() => TE.right<ControllerError, GroupEntity[]>([])),
              ),
              keywords: pipe(
                details
                  .filter((d) => d.type === "keyword")
                  .reduce<
                    string[]
                  >((acc, a) => (acc.includes(a.value) ? acc : acc.concat(a.value.toLowerCase())), []),
                O.fromPredicate((l) => l.length > 0),
                O.map((tags) =>
                  ctx.db.find(KeywordEntity, {
                    select: ["id", "tag"],
                    where: {
                      tag: In(tags),
                    },
                  }),
                ),
                O.getOrElse(() =>
                  TE.right<ControllerError, KeywordEntity[]>([]),
                ),
              ),
              media: TE.right([]),
              links: TE.right([]),
              areas: TE.right([]),
              groupsMembers: TE.right([]),
            }),
            TE.map((relations) => ({ entities: relations, sentences })),
          ),
        ),
      );
    }),
  );
};
