import { fc } from "@econnessione/core/tests";
import { URL } from "@econnessione/shared/io/Common";
import { ActorArb } from "@econnessione/shared/tests/arbitrary/Actor.arbitrary";
import { EventArb } from "@econnessione/shared/tests/arbitrary/Event.arbitrary";
import { GroupArb } from "@econnessione/shared/tests/arbitrary/Group.arbitrary";
import { PageArb } from "@econnessione/shared/tests/arbitrary/Page.arbitrary";
import { URLArb } from "@econnessione/shared/tests/arbitrary/utils.arbitrary";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { PathReporter } from "io-ts/lib/PathReporter";
import { makeContext } from "../../server";
import { AvatarsFixture } from "./avatars.fixtures";
import { ActorEntity } from "@entities/Actor.entity";
import { EventEntity } from "@entities/Event.entity";
import { GroupEntity } from "@entities/Group.entity";
import { GroupMemberEntity } from "@entities/GroupMember.entity";
import { PageEntity } from "@entities/Page.entity";
import { ServerError } from "@io/ControllerError";

const shuffleArray = (input: any[]): any[] => {
  const arr = [...input];
  const shuffled = [];
  while (arr.length > 0) {
    const randIdx = Math.floor(Math.random() * arr.length);
    shuffled.push(arr[randIdx]);
    arr.splice(randIdx, 1);
  }
  return shuffled;
};

const run = (): Promise<void> => {
  const pages = ["index", "events", "vaccines"].map((path) => ({
    ...fc.sample(PageArb, 1)[0],
    path,
  }));

  const links = pipe(
    fc.sample(
      fc.record({
        url: URLArb(),
        description: fc.string(),
      }),
      50
    ),
    A.map((link) =>
      pipe(
        link.url,
        URL.decode,
        E.map((url) => ({ ...link, url }))
      )
    ),
    A.sequence(E.Applicative),
    E.fold(
      (e) => {
        // eslint-disable-next-line
        console.error(PathReporter.report(E.left(e)));
        return [];
      },
      (urls) => urls
    )
  );

  const actors = fc
    .sample(ActorArb, 100)
    .map(({ death, ...a }) => ({ ...a, memberIn: [] }));
  const groups = fc.sample(GroupArb, 100).map((g) => ({ ...g, members: [] }));
  const events = fc.sample(EventArb, 100).map((g) => ({
    ...g,
    groups: A.takeLeft(20)(shuffleArray(groups)),
    actors: A.takeLeft(20)(shuffleArray(actors)),
    groupsMembers: [],
    links: A.takeLeft(20)(shuffleArray(links)),
  }));

  return pipe(
    makeContext(process.env),
    TE.chain((ctx) => {
      const avatarProvider = AvatarsFixture({
        client: ctx.s3,
      });
      return pipe(
        ctx.db.transaction((tClient) => {
          return pipe(
            sequenceS(TE.ApplicativeSeq)({
              pages: pipe(
                tClient.find(PageEntity, {
                  where: pages.map((p) => ({ path: p.path })),
                }),
                TE.chain((results) => {
                  const pp = pages.reduce<PageEntity[]>((acc, p) => {
                    const pIdx = results.findIndex((r) => r.path === p.path);
                    if (pIdx >= 0) {
                      return acc;
                    }
                    return acc.concat(p);
                  }, []);

                  return tClient.save(PageEntity, pp);
                })
              ),
              actors: pipe(
                actors,
                A.map((a) =>
                  pipe(
                    avatarProvider.saveAvatar("actors", a.id),
                    TE.map((avatar) => ({ ...a, avatar }))
                  )
                ),
                TE.sequenceSeqArray,
                TE.mapLeft((e) => ServerError()),
                TE.chain((results) => tClient.save(ActorEntity, results as any))
              ),
              groups: pipe(
                groups,
                A.map((g) =>
                  pipe(
                    avatarProvider.saveBotAvatar("groups", g.id),
                    TE.map((avatar) => ({ ...g, avatar }))
                  )
                ),
                TE.sequenceArray,
                TE.mapLeft((e) => ServerError()),
                TE.chain((results) =>
                  tClient.save(GroupEntity, [...results] as any)
                )
              ),
            }),
            TE.chain(({ actors, groups }) => {
              const groupsMembers = A.range(0, 100).map((i) => ({
                actor: { id: shuffleArray(actors)[0].id },
                group: { id: shuffleArray(groups)[0].id },
                startDate: new Date(),
                body: fc.sample(fc.lorem({ maxCount: 100 }), 1)[0],
              }));

              return pipe(
                tClient.save(GroupMemberEntity, groupsMembers),
                TE.chain((results) =>
                  tClient.save(
                    EventEntity,
                    events.map((e) => ({
                      ...e,
                      groupsMembers: results.map((g) => g.id) as any,
                    }))
                  )
                )
              );
            })
          );
        }),
        TE.chain(() => ctx.db.close())
      );
    })
  )().then(() => undefined);
};

// eslint-disable-next-line
run().catch(console.error);
