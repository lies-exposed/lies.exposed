import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ScientificStudyEntity } from "@entities/ScientificStudy.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toScientificStudyIO = (
  scientificStudy: ScientificStudyEntity
): E.Either<ControllerError, io.http.ScientificStudy.ScientificStudy> => {
  return pipe(
    io.http.ScientificStudy.ScientificStudy.decode({
      ...scientificStudy,
      abstract: scientificStudy.abstract ?? undefined,
      results: scientificStudy.results ?? undefined,
      publishDate: scientificStudy.publishDate.toISOString(),
      createdAt: scientificStudy.createdAt.toISOString(),
      updatedAt: scientificStudy.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
