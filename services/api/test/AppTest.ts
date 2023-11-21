import path from "path";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider";
import { ENV } from "@io/ENV";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider";
import { GetLogger } from "@liexp/core/lib/logger";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { getDataSource } from "@utils/data-source";
import D from "debug";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import supertest from "supertest";
import {
  type DataSource,
  type EntityTarget,
  type ObjectLiteral,
} from "typeorm";
import { igProviderMock } from "../__mocks__/ig.mock";
import puppeteerMocks from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";
import { wikipediaProviderMock } from "../__mocks__/wikipedia.mock";
import { type RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { mocks, type AppMocks } from "./mocks";
import { ActorEntity } from "@entities/Actor.entity";
import { AreaEntity } from "@entities/Area.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";
import { KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { toControllerError } from "@io/ControllerError";
import { EventsConfig } from "@queries/config";

export interface AppTest {
  ctx: RouteContext;
  mocks: AppMocks;
  req: supertest.SuperTest<supertest.Test>;
  utils: {
    e2eAfterAll: () => Promise<boolean>;
  };
}

const g = global as any as {
  appTest: AppTest;
  dataSource: DataSource;
};

export const GetAppTest = async (): Promise<AppTest> => {
  if (!g.appTest) {
    g.appTest = await initAppTest();
  }
  return g.appTest;
};

export const initAppTest = async (): Promise<AppTest> => {
  D.enable(process.env.DEBUG ?? "-");

  const logger = GetLogger("test");

  const cwd = path.resolve(__dirname, "../");
  // if (!g.dataSource) {
  //   const dataSource = getDataSource(process.env as any, false);
  //   g.dataSource = await dataSource.initialize();
  // }

  return await pipe(
    sequenceS(TE.ApplicativePar)({
      db: GetTypeORMClient(getDataSource(process.env as any, false)),
      env: pipe(
        ENV.decode(process.env),
        TE.fromEither,
        TE.mapLeft(toControllerError),
      ),
    }),
    TE.map(({ db, env }) => ({
      env,
      db,
      logger,
      config: {
        events: EventsConfig,
        dirs: {
          cwd,
          temp: {
            root: path.resolve(cwd, "temp"),
            media: path.resolve(cwd, "temp/media"),
          },
        },
      },
      jwt: GetJWTProvider({ secret: env.JWT_SECRET, logger }),
      ffmpeg: {
        ffprobe: (file: any) => {
          return TE.right({} as any);
        },
        runCommand: () => {
          return TE.right("");
        },
      },
      puppeteer: GetPuppeteerProvider(puppeteerMocks, { headless: "new" }),
      tg: tgProviderMock,
      s3: MakeSpaceProvider(mocks.s3 as any),
      ig: igProviderMock,
      fs: GetFSClient(),
      wp: wikipediaProviderMock,
      urlMetadata: {
        fetchHTML: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchHTML(url, opts) as Promise<any>,
            (e) => e as any,
          );
        },
        fetchMetadata: (url: string, opts: any) => {
          return TE.tryCatch(
            () => mocks.urlMetadata.fetchMetadata(url, opts) as Promise<any>,
            (e) => e as any,
          );
        },
      },
      http: HTTPProvider(mocks.axios as any),
      imgProc: MakeImgProcClient({
        logger,
        exifR: {} as any,
        client: (() => Promise.resolve(Buffer.from([]))) as any,
      }),
      geo: GeocodeProvider({ http: {} as any }),
    })),
    TE.map((ctx) => ({
      ctx,
      mocks,
      utils: {
        e2eAfterAll: async () => {
          const liftFind = <E extends ObjectLiteral>(
            e: EntityTarget<E>,
          ): TE.TaskEither<Error, boolean> =>
            pipe(
              ctx.db.find(e, { take: 100 }),
              TE.chain((els) =>
                els.length > 0
                  ? ctx.db.delete(
                      e,
                      els.map((e) => e.id),
                    )
                  : TE.right({ affected: 0, raw: {} }),
              ),
              TE.map((r) => (r.affected ?? 0) >= 0),
            );

          return await pipe(
            sequenceS(TE.ApplicativePar)({
              link: liftFind(LinkEntity),
              media: liftFind(MediaEntity),
              keyword: liftFind(KeywordEntity),
              actor: liftFind(ActorEntity),
              group: liftFind(GroupEntity),
              event: liftFind(EventV2Entity),
              area: liftFind(AreaEntity),
            }),
            TE.map(({ media, actor }) => media && actor),
            throwTE,
          );
        },
      },
      req: supertest(makeApp(ctx)),
    })),
    TE.map((app) => {
      return app;
    }),
    throwTE,
  );
};
