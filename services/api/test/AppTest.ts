import { getDataSource } from "@utils/data-source";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { toControllerError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider";
import { MakeSpaceClient } from "@liexp/backend/lib/providers/space/SpaceClient";
import { GetLogger } from "@liexp/core/lib/logger";
import { HTTP } from "@liexp/shared/lib/providers/http/http.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import supertest from "supertest";
import { DataSource, type EntityTarget, type ObjectLiteral } from "typeorm";
import { awsMock } from "../__mocks__/aws.mock";
import { igProviderMock } from "../__mocks__/ig.mock";
import puppeteerMocks from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";
import { wikipediaProviderMock } from "../__mocks__/wikipedia.mock";
import { type RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { mocks, type AppMocks } from "./mocks";

export interface AppTest {
  ctx: RouteContext;
  mocks: AppMocks;
  req: supertest.SuperTest<supertest.Test>;
  utils: {
    e2eAfterAll: () => Promise<boolean>;
  };
}

let appTest: AppTest, dataSource: DataSource;

export const GetAppTest = async (): Promise<AppTest> => {
  if (!appTest || !dataSource) {
    await initAppTest();
  }
  return appTest;
};

// const setDataSource = (d: DataSource): void => {
//   (global as any).dataSource = d;
// };

export const initAppTest = async (): Promise<AppTest> => {
  D.enable(process.env.DEBUG ?? "*");

  // const dataSource = (global as any).dataSource;
  // if (!dataSource) {
  //   setDataSource(getDataSource(process.env as any, false));
  // }

  const logger = GetLogger("test");

  if (!dataSource) {
    dataSource = getDataSource(process.env as any, false);
  }

  return await pipe(
    sequenceS(TE.ApplicativePar)({
      db: GetTypeORMClient(dataSource),
      env: pipe(
        ENV.decode(process.env),
        TE.fromEither,
        TE.mapLeft(toControllerError)
      ),
    }),
    TE.map(({ db, env }) => ({
      env,
      db,
      logger,
      jwt: GetJWTProvider({ secret: env.JWT_SECRET, logger }),
      ffmpeg: {
        runCommand: () => {
          return TE.right("");
        },
      },
      puppeteer: GetPuppeteerProvider(puppeteerMocks, { headless: "new" }),
      tg: tgProviderMock,
      s3: MakeSpaceClient({
        client: awsMock as any,
      }),
      ig: igProviderMock,
      fs: GetFSClient(),
      wp: wikipediaProviderMock,
      urlMetadata: {
        fetchHTML: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchHTML(url, opts) as Promise<any>,
            (e) => e as any
          );
        },
        fetchMetadata: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchMetadata(url, opts) as Promise<any>,
            (e) => e as any
          );
        },
      },
      http: HTTP({}),
    })),
    TE.map((ctx) => ({
      ctx,
      mocks,
      utils: {
        e2eAfterAll: () => {
          const liftFind = <E extends ObjectLiteral>(
            e: EntityTarget<E>
          ): TE.TaskEither<Error, boolean> =>
            pipe(
              ctx.db.findAndCount(e, {}),
              TE.filterOrElse(
                ([ents, count]) => count === 0,
                ([ents, count]) =>
                  new Error(`Entity ${(e as any).name} contains ${count}`)
              ),
              TE.map(([ents, count]) => count === 0)
            );

          return pipe(
            sequenceS(TE.ApplicativePar)({
              link: liftFind(LinkEntity),
              media: liftFind(MediaEntity),
              keyword: liftFind(KeywordEntity),
              actor: liftFind(ActorEntity),
              group: liftFind(GroupEntity),
              event: liftFind(EventV2Entity),
            }),
            TE.map(({ media, actor }) => media && actor),
            // TE.chainFirst(() => TE.mapLeft((e) => e)(ctx.db.close())),
            // TE.chainFirst(() => {
            //   return TE.fromIO(() => {
            //     global.gc?.();
            //   });
            // }),
            throwTE
          );
        },
      },
      req: supertest(makeApp(ctx)),
    })),
    TE.map((app) => {
      appTest = app;
      // (global as any).dataSource = dataSource;
      return appTest;
    }),
    throwTE
  );
};
