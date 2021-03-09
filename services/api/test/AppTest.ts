import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import supertest from "supertest";
import { RouteContext } from "../src/routes/route.types";
import { makeContext, makeApp } from "../src/server";

export interface AppTest {
  ctx: RouteContext;
  req: supertest.SuperTest<supertest.Test>;
}

export const initAppTest = async (): Promise<AppTest> => {
  return pipe(
    makeContext(process.env),
    TE.map((ctx) => ({
      ctx,
      req: supertest(makeApp(ctx)),
    }))
  )().then((value) => {
    if (E.isRight(value)) {
      return value.right;
    }
    throw value.left;
  });
};
