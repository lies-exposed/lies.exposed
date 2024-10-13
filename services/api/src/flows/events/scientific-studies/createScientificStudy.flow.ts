import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { CreateScientificStudyBody } from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
import { createScientificStudyFromPlainObject } from "./createFromPlainObject.flow.js";
import { createEventFromURL } from "./createFromURL.flow.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const createScientificStudy = (
  body: CreateScientificStudyBody,
  req: Express.Request,
): TEReader<EventV2Entity> => {
  if (CreateScientificStudyBody.types[1].is(body)) {
    return pipe(
      ensureUserExists(req.user),
      fp.RTE.fromEither,
      fp.RTE.map((u) => {
        const user = new UserEntity();
        user.id = u.id;
        return user;
      }),
      fp.RTE.chain((u) => createEventFromURL(u, body.url)),
    );
  }
  return createScientificStudyFromPlainObject(body);
};
