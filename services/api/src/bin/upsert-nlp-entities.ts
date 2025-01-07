import { upsertNLPEntities as upsertNLPEntitiesFlow } from "@liexp/backend/lib/flows/admin/nlp/upsertEntities.flow.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type CommandFlow } from "./command.type.js";
import { toControllerError } from "#io/ControllerError.js";

export const upsertNLPEntities: CommandFlow = async (ctx) => {
  const result = await pipe(
    upsertNLPEntitiesFlow(ctx),
    TE.chain((entities) => {
      const nplConfig = ctx.fs.resolve(`config/nlp/entities.json`);

      return pipe(
        ctx.fs.writeObject(nplConfig, JSON.stringify(entities, null, 4)),
        TE.mapLeft(toControllerError),
      );
    }),
  )();

  ctx.logger.info.log("Output: %O", result);
};
