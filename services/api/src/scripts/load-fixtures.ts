import { fc } from "@econnessione/core/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { EventArb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { PageArb } from "@econnessione/shared/tests/arbitrary/Page.arbitrary";
import { ActorEntity } from "@entities/Actor.entity";
import { EventEntity } from "@entities/Event.entity";
import { GroupEntity } from "@entities/Group.entity";
import { PageEntity } from "@entities/Page.entity";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../server";

const run = (): Promise<void> => {
  const pages = ["index", "events", "vaccines"].map((path) => ({
    ...fc.sample(PageArb, 1)[0],
    path,
  }));
  const actors = fc.sample(ActorArb, 100).map(({ death, ...a }) => ({ ...a }));
  const groups = fc.sample(GroupArb, 100).map((g) => ({ ...g, members: [] }));
  const events = fc.sample(EventArb, 100).map((g) => ({
    ...g,
    groups: A.takeLeft(20)(groups),
    actors: A.takeLeft(20)(actors),
    groupsMembers: [],
    links: [],
  }));

  return pipe(
    makeContext(process.env),
    TE.chain((ctx) => {
      return pipe(
        ctx.db.transaction((tClient) => {
          return pipe(
            sequenceS(TE.taskEitherSeq)({
              pages: tClient.save(PageEntity, pages),
              actors: tClient.save(ActorEntity, actors),
              groups: tClient.save(GroupEntity, groups),
            }),
            TE.chain(() => tClient.save(EventEntity, events))
          );
        }),
        TE.chain(() => ctx.db.close())
      );
    })
  )().then(() => undefined);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
