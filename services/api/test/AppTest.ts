import { GetLogger } from "@liexp/core/lib/logger";
import { GetFSClient } from "@liexp/shared/lib/providers/fs/fs.provider";
import { HTTP } from "@liexp/shared/lib/providers/http/http.provider";
import { GetJWTClient } from "@liexp/shared/lib/providers/jwt/JWTClient";
import { GetTypeORMClient } from "@liexp/shared/lib/providers/orm";
import { GetPuppeteerProvider } from "@liexp/shared/lib/providers/puppeteer.provider";
import { MakeSpaceClient } from "@liexp/shared/lib/providers/space/SpaceClient";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import supertest from "supertest";
import {
  type EntityTarget,
  type DataSource,
  type ObjectLiteral,
} from "typeorm";
import { awsMock } from "../__mocks__/aws.mock";
import { igProviderMock } from '../__mocks__/ig.mock';
import puppeteerMocks from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";
import { type RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { type AppMocks, mocks } from "./mocks";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { toControllerError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { getDataSource } from "@utils/data-source";

export interface AppTest {
  ctx: RouteContext;
  mocks: AppMocks;
  req: supertest.SuperTest<supertest.Test>;
  utils: {
    e2eAfterAll: () => Promise<boolean>;
  };
}

export const GetAppTest = (): AppTest => {
  const appTestG = (global as any).appTest;
  // console.log("get global", appTestG);
  return appTestG;
};

const setDataSource = (d: DataSource): void => {
  (global as any).dataSource = d;
};

export const initAppTest = async (): Promise<AppTest> => {
  const appTest = GetAppTest();
  if (appTest) {
    // console.log("app test exists!!!");
    return appTest;
  }

  D.enable(process.env.DEBUG ?? "*");

  const dataSource = (global as any).dataSource;
  if (!dataSource) {
    setDataSource(getDataSource(process.env as any, false));
  }

  const logger = GetLogger("test");

  return await pipe(
    sequenceS(TE.ApplicativePar)({
      db: GetTypeORMClient((global as any).dataSource),
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
      jwt: GetJWTClient({ secret: env.JWT_SECRET, logger }),
      ffmpeg: {
        runCommand: () => {
          return TE.right("");
        },
      },
      puppeteer: GetPuppeteerProvider(puppeteerMocks, { headless: false }),
      tg: tgProviderMock,
      s3: MakeSpaceClient({
        client: awsMock as any,
      }),
      ig: igProviderMock,
      fs: GetFSClient(),
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
              TE.map(([ents, count]) => true)
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
            TE.chainFirst(() => {
              return TE.fromIO(() => {
                global.gc?.();
              });
            }),
            throwTE
          );
        },
      },
      req: supertest(makeApp(ctx)),
    })),
    TE.map((appTest) => {
      (global as any).appTest = appTest;
      (global as any).dataSource = dataSource;
      // console.log(global);
      return appTest;
    }),
    throwTE
  );
};
