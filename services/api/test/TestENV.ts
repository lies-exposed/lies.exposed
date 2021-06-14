import * as t from "io-ts";
import { ENV } from "../src/io/ENV";

export const TestENV = t.intersection(
  [ENV, t.strict({ npm_lifecycle_event: t.string })],
  "TestENV"
);
