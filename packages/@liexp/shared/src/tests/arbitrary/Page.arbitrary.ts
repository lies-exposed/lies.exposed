import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const { createdAt, updatedAt, deletedAt, id, ...pageProps } =
  http.Page.Page.type.props;

export const PageArb: tests.fc.Arbitrary<http.Page.Page> = tests
  .getArbitrary(t.strict({ ...pageProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));
