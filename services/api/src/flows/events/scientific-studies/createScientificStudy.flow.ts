import { type EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ScientificStudy } from "@liexp/shared/lib/io/http/Events/index.js";
import { Equal } from "typeorm";
import { createScientificStudyFromPlainObject } from "./createFromPlainObject.flow.js";
import { type TEReader } from "#flows/flow.types.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const createScientificStudy = (
  body: ScientificStudy.CreateScientificStudyBody,
  req: Express.Request,
): TEReader<EventV2Entity> => {
  return pipe(
    ensureUserExists(req.user),
    fp.RTE.fromEither,
    fp.RTE.chain((u) =>
      UserRepository.findOneOrFail({ where: { id: Equal(u.id) } }),
    ),
    fp.RTE.chain((u) => createScientificStudyFromPlainObject(body, u)),
  );
};
