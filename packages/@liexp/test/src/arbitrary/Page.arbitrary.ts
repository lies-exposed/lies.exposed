import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import type fc from "fast-check";

export const PageArb: fc.Arbitrary<http.Page.Page> = Arbitrary.make(
  http.Page.Page,
).map((p) => ({
  ...p,
  deletedAt: undefined,
}));
