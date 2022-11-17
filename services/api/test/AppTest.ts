import { toControllerError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetLogger } from "@liexp/core/logger";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { GetJWTClient } from "@liexp/shared/providers/jwt/JWTClient";
import { GetTypeORMClient } from "@liexp/shared/providers/orm";
import { MakeSpaceClient } from "@liexp/shared/providers/space/SpaceClient";
import { getDataSource } from "@utils/data-source";
import { sequenceS } from "fp-ts/Apply";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { awsMock } from "../__mocks__/aws.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";
import puppeteerMocks from "../__mocks__/puppeteer.mock";
import { GetPuppeteerProvider } from "@liexp/shared/providers/puppeteer.provider";
export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
  mocks: {
    tg: typeof tgProviderMock;
    s3: typeof awsMock;
    urlMetadata: {
      fetchMetadata: jest.Mock<any, any>;
    };
    puppeteer: typeof puppeteerMocks;
  };
}

export const GetAppTest = (): AppTest => {
  const appTestG = (global as any).appTest;
  // console.log("get global", appTestG);
  return appTestG;
};

export const initAppTest = async (): Promise<AppTest> => {
  const appTest = GetAppTest();
  if (appTest) {
    console.log("app test exists!!!");
    return appTest;
  }

  const dataSource = getDataSource(process.env as any, false);
  

  const fetchHTML = jest.fn();
  const fetchMetadata = jest.fn();

  const logger = GetLogger("@test");

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
            () => fetchHTML(url, opts) as Promise<any>,
            (e) => e as any
          );
        },
        fetchMetadata: (url: string, opts: any) => {
          return TE.tryCatch(
            () => fetchMetadata(url, opts) as Promise<any>,
            (e) => e as any
          );
        },
      },
    })),
    TE.map((ctx) => ({
      ctx,
      mocks: {
        tg: tgProviderMock,
        s3: awsMock,
        urlMetadata: {
          fetchHTML: fetchHTML as any,
          fetchMetadata: fetchMetadata as any,
        },
        puppeteer: puppeteerMocks,
      },

      req: supertest(makeApp(ctx)),
    })),
    TE.map((appTest) => {
      (globalThis as any).appTest = appTest;
      (global as any).appTest = appTest;
      (global as any).dataSource = dataSource;
      return appTest;
    }),
    throwTE
  );
};
