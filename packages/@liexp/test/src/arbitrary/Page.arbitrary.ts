import * as http from "@liexp/shared/lib/io/http/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const { createdAt, updatedAt, deletedAt, id, ...pageProps } =
  http.Page.Page.type.props;

export const PageArb: fc.Arbitrary<http.Page.Page> = getArbitrary(
  t.strict({ ...pageProps }),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
