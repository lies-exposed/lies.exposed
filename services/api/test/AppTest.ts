import path from "path";
import { GetFSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { GeocodeProvider } from "@liexp/backend/lib/providers/geocode/geocode.provider.js";
import { MakeImgProcClient } from "@liexp/backend/lib/providers/imgproc/imgproc.provider.js";
import { GetJWTProvider } from "@liexp/backend/lib/providers/jwt/jwt.provider.js";
import { GetNERProvider } from "@liexp/backend/lib/providers/ner/ner.provider.js";
import { GetTypeORMClient } from "@liexp/backend/lib/providers/orm/index.js";
import { GetPuppeteerProvider } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { MakeSpaceProvider } from "@liexp/backend/lib/providers/space/space.provider.js";
import { GetLogger } from "@liexp/core/lib/logger/index.js";
import { HTTPProvider } from "@liexp/shared/lib/providers/http/http.provider.js";
import { PDFProvider } from '@liexp/shared/lib/providers/pdf/pdf.provider.js';
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import supertest from "supertest";
import type TestAgent from 'supertest/lib/agent.js';
import {
  type DataSource,
  type EntityTarget,
  type ObjectLiteral,
} from "typeorm";
import { type RouteContext } from "../src/routes/route.types.js";
import { mocks, type AppMocks } from "./mocks.js";
import { makeApp } from "#app/index.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { GroupMemberEntity } from "#entities/GroupMember.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { toControllerError } from "#io/ControllerError.js";
import { ENV } from "#io/ENV.js";
import { getDataSource } from "#utils/data-source.js";
import { Config } from '#app/config.js';
import { GetFFMPEGProvider } from '@liexp/backend/lib/providers/ffmpeg.provider.js';

vi.mock("axios");
vi.mock("page-metadata-parser");
vi.mock("puppeteer-core", () => ({ KnownDevices: {} }));
vi.mock("@aws-sdk/client-s3");
vi.mock("@aws-sdk/s3-request-presigner");
vi.mock("@aws-sdk/lib-storage");
vi.mock("node-telegram-bot-api");

export interface AppTest {
  ctx: RouteContext;
  mocks: AppMocks;
  req: TestAgent<supertest.Test>;
  utils: {
    e2eAfterAll: () => Promise<boolean>;
  };
}

const initAppTest = async (): Promise<AppTest> => {
  D.enable(process.env.DEBUG ?? "-");

  const logger = GetLogger("test");

  // if (!g.dataSource) {
  //   const dataSource = getDataSource(process.env as any, false);
  //   g.dataSource = await dataSource.initialize();
  // }

  const appTest = await pipe(
    sequenceS(TE.ApplicativePar)({
      db: pipe(
        getDataSource(process.env as any, false),
        TE.chain((source) => GetTypeORMClient(source)),
      ),
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
      config: Config(env),
      jwt: GetJWTProvider({ secret: env.JWT_SECRET, logger }),
      ffmpeg: GetFFMPEGProvider(mocks.ffmpeg),
      puppeteer: GetPuppeteerProvider(mocks.puppeteer, { headless: "new" }, mocks.puppeteer.devices),
      tg: mocks.tg,
      s3: MakeSpaceProvider(mocks.s3 as any),
      ig: mocks.ig,
      fs: GetFSClient(),
      wp: mocks.wiki,
      rw: mocks.wiki,
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
        exifR: mocks.exifR,
        client: mocks.sharp as any,
      }),
      ner: GetNERProvider({
        logger,
        entitiesFile: path.resolve(__dirname, "entities.json"),
        nlp: mocks.ner as any,
      }),
      langchain: {} as any,
      queue: {} as any,
      openai: {} as any,
      pdf: PDFProvider({ client: {} as any }),
      geo: GeocodeProvider({ http: {} as any, apiKey: "fake-geo-api-key" }),
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

          return pipe(
            sequenceS(TE.ApplicativeSeq)({
              link: liftFind(LinkEntity),
              keyword: liftFind(KeywordEntity),
              groupMembers: liftFind(GroupMemberEntity),
              actor: liftFind(ActorEntity),
              group: liftFind(GroupEntity),
              media: liftFind(MediaEntity),
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

  return appTest;
};

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
