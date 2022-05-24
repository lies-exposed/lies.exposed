import { MakeSpaceClient } from "@providers/space/SpaceClient";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeApp, makeContext } from "../src/server";
import { awsMock } from "./mocks/aws.mock";

export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
  mocks: {
    urlMetadata: {
      fetchMetadata: jest.Mock<any, any>;
    };
  };
}

export const initAppTest = async (): Promise<AppTest> => {
  const fetchHTML = jest.fn();
  const fetchMetadata = jest.fn();

  return await pipe(
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
    }))
  )().then((value) => {
    if (E.isRight(value)) {
      return value.right;
    }
    throw value.left;
  });
};
