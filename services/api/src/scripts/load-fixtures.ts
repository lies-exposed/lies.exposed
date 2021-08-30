import { fc } from "@econnessione/core/tests";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { EventArb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";
import { PageArb } from "@econnessione/shared/tests/arbitrary/Page.arbitrary";
import { ActorEntity } from "@entities/Actor.entity";
import { EventEntity } from "@entities/Event.entity";
import { PageEntity } from "@entities/Page.entity";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../server";

const run = (): Promise<void> => {
  const pages = ["index", "events", "vaccines"].map((path) => ({
    ...fc.sample(PageArb, 1)[0],
    path,
  }));
  const actors = fc.sample(ActorArb, 10).map(({ death, ...a }) => ({ ...a }));
  const events = fc.sample(EventArb, 10).map((g) => ({
    ...g,
    groups: [],
    groupsMembers: [],
    actors: [],
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
            }),
            TE.chain(() =>
              tClient.save(
                EventEntity,
                events.map((a) => ({ ...a, actors: [] }))
              )
            )
          );
        }),
        TE.chain(() => ctx.db.close())
      );
    })
  )().then(() => undefined);
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
