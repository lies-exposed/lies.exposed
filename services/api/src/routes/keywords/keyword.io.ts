import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { KeywordEntity } from "../../entities/Keyword.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toKeywordIO = (
  a: KeywordEntity
): E.Either<ControllerError, io.http.Keyword.Keyword> => {
  return pipe(
    io.http.Keyword.Keyword.decode({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
