import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeContext, makeApp } from "../src/server";
import * as fc from "fast-check";
import { TagArb } from "@econnessione/shared/tests/arbitrary/Keyword.arbitrary";
import { MakeSpaceClient } from "@providers/space/SpaceClient";
import { awsMock } from "./mocks/aws.mock";

export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
}

export const initAppTest = async (): Promise<AppTest> => {
  return pipe(
    makeContext(process.env),
    TE.map((ctx) => ({
      ...ctx,
      s3: MakeSpaceClient({
        client: awsMock as any,
      }),
      urlMetadata: {
        fetchMetadata: (url: string) =>
          TE.right(
            fc.sample(
              fc.record({
                title: fc.string(),
                description: fc.string(),
                keywords: fc.array(TagArb()),
                icon: fc.webUrl(),
                image: fc.webUrl(),
                provider: fc.string(),
                type: fc.string(),
                url: fc.constant(url),
              })
            )[0]
          ),
      },
    })),
    TE.map((ctx) => ({
      ctx: ctx,
      req: supertest(makeApp(ctx)),
    }))
  )().then((value) => {
    if (E.isRight(value)) {
      return value.right;
    }
    throw value.left;
  });
};
