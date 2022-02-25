import * as io from "@liexp/shared/io";
import { toColor } from "@liexp/shared/io/http/Common";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { KeywordEntity } from "../../entities/Keyword.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toKeywordIO = (
  keyword: KeywordEntity
): E.Either<ControllerError, io.http.Keyword.Keyword> => {
  return pipe(
    io.http.Keyword.Keyword.decode({
      ...keyword,
      color: keyword.color ? toColor(keyword.color) : "000000",
      createdAt: keyword.createdAt.toISOString(),
      updatedAt: keyword.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode keyword (${keyword.id})`, e))
  );
};
