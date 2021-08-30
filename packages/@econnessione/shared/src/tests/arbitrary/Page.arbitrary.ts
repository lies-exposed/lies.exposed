import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const { createdAt, updatedAt, ...pageProps } = http.Page.Page.type.props;

export const PageArb: tests.fc.Arbitrary<http.Page.Page> = tests
  .getArbitrary(t.strict({ ...pageProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
