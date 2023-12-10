import * as t from "io-ts";
import { ENV } from "#io/ENV.js";

export const TestENV = t.intersection(ENV.types, "TestENV");
