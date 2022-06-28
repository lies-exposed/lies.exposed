import { toControllerError } from "@io/ControllerError";
import { ENV } from "@io/ENV";
import { GetLogger } from "@liexp/core/logger";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { GetJWTClient } from "@providers/jwt/JWTClient";
import { GetTypeORMClient } from "@providers/orm";
import { MakeSpaceClient } from "@providers/space/SpaceClient";
import { getDataSource } from "@utils/data-source";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeApp } from "../src/server";
import { awsMock } from "../__mocks__/aws.mock";
import { tgProviderMock } from "../__mocks__/tg.mock";

export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
  mocks: {
    tg: typeof tgProviderMock;
    s3: typeof awsMock;
    urlMetadata: {
      fetchMetadata: jest.Mock<any, any>;
    };
  };
}

let appTest: AppTest;

export const initAppTest = async (): Promise<AppTest> => {
  if (appTest) {
    return await Promise.resolve(appTest);
  }

  const fetchHTML = jest.fn();
  const fetchMetadata = jest.fn();

  const logger = GetLogger("@test");

  appTest = await pipe(
    sequenceS(TE.ApplicativePar)({
      db: GetTypeORMClient(getDataSource(process.env as any, false)),
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
      puppeteer: {} as any,
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
      ctx: ctx,
      mocks: {
        tg: tgProviderMock,
        s3: awsMock,
        urlMetadata: {
          fetchHTML: fetchHTML as any,
          fetchMetadata: fetchMetadata as any,
        },
      },
      req: supertest(makeApp(ctx)),
    })),
    throwTE
  );

  return appTest;
};
