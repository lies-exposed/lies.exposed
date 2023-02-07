import { toControllerError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetLogger } from "@liexp/core/logger";
import { HTTP } from "@liexp/shared/providers/http/http.provider";
import { GetJWTClient } from "@liexp/shared/providers/jwt/JWTClient";
import { GetTypeORMClient } from "@liexp/shared/providers/orm";
import { GetPuppeteerProvider } from "@liexp/shared/providers/puppeteer.provider";
import { MakeSpaceClient } from "@liexp/shared/providers/space/SpaceClient";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { getDataSource } from "@utils/data-source";
import D from "debug";
import { sequenceS } from "fp-ts/Apply";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import supertest from "supertest";
import { DataSource } from "typeorm";
import { RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { awsMock } from "../__mocks__/aws.mock";
import puppeteerMocks from "../__mocks__/puppeteer.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";
import { mocks, AppMocks } from "./mocks";

export interface AppTest {
  ctx: RouteContext;
  mocks: AppMocks;
  req: supertest.SuperTest<supertest.Test>;
  utils: {};
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
    console.log("app test exists!!!");
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
      utils: {},
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

