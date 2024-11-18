import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as E from "fp-ts/lib/Either.js";
import { type KeywordEntity } from "../../entities/Keyword.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toKeywordIO = (
  keyword: KeywordEntity,
): E.Either<ControllerError, io.http.Keyword.Keyword> => {
  return pipe(
    io.http.Keyword.Keyword.decode({
      ...keyword,
      socialPosts: keyword.socialPosts ?? [],
      color: keyword.color ? toColor(keyword.color) : "000000",
      createdAt: keyword.createdAt.toISOString(),
      updatedAt: keyword.updatedAt.toISOString(),
      deletedAt: keyword.deletedAt?.toISOString() ?? undefined,
    }),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode keyword (${keyword.id})`, e),
    ),
  );
};

export const KeywordIO = IOCodec(toKeywordIO, "keyword");
