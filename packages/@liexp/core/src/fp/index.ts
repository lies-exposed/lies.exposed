import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as IOE from "fp-ts/IOEither";
import * as Json from "fp-ts/Json";
import * as Map from "fp-ts/Map";
import * as NEA from "fp-ts/NonEmptyArray";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import * as R from "fp-ts/Record";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { pipe, flow } from "fp-ts/function";
import * as N from "fp-ts/number";
import * as S from "fp-ts/string";

export const fp = {
  A,
  E,
  O,
  TE,
  T,
  Map,
  NEA,
  R,
  S,
  IOE,
  N,
  Ord,
  Json,
};

export { pipe, flow };
