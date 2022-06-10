import { throwTE } from "@liexp/shared/utils/task.utils";
import { MakeSpaceClient } from "@providers/space/SpaceClient";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeApp, makeContext } from "../src/server";
import { awsMock } from "../__mocks__/aws.mock";

export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
  mocks: {
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

  appTest = await pipe(
    makeContext(process.env),
    TE.map((ctx) => ({
      ...ctx,
      puppeteer: {} as any,
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
