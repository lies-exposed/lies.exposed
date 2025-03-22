import { sequenceS, sequenceT } from "fp-ts/lib/Apply.js";
import * as date from "fp-ts/lib/Date.js";
import * as E from "fp-ts/lib/Either.js";
import * as Eq from "fp-ts/lib/Eq.js";
import * as IO from "fp-ts/lib/IO.js";
import * as IOE from "fp-ts/lib/IOEither.js";
import * as Json from "fp-ts/lib/Json.js";
import * as Map from "fp-ts/lib/Map.js";
import * as NEA from "fp-ts/lib/NonEmptyArray.js";
import * as O from "fp-ts/lib/Option.js";
import * as Ord from "fp-ts/lib/Ord.js";
import * as R from "fp-ts/lib/Reader.js";
import * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import * as A from "fp-ts/lib/ReadonlyArray.js";
import * as Rec from "fp-ts/lib/Record.js";
import * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe, flow } from "fp-ts/lib/function.js";
import * as N from "fp-ts/lib/number.js";
import * as S from "fp-ts/lib/string.js";
import * as Void from "fp-ts/lib/void.js";

export const fp = {
  A,
  E,
  O,
  TE,
  T,
  Map,
  NEA,
  R,
  Rec,
  RTE,
  S,
  IO,
  IOE,
  N,
  Ord,
  Json,
  Eq,
  Void,
  Date: date,
  sequenceS,
  sequenceT,
};

export { pipe, flow };
