import path from "path";
import { upsertNLPEntities as upsertNLPEntitiesFlow } from "@liexp/backend/lib/flows/admin/nlp/upsertEntities.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type CommandFlow } from "./command.type.js";

export const upsertNLPEntities: CommandFlow = (ctx) => {
  return pipe(
    upsertNLPEntitiesFlow(ctx),
    fp.TE.chain((entities) =>
      ctx.fs.writeObject(
        path.resolve(ctx.config.dirs.config.nlp, "entities.json"),
        JSON.stringify(entities),
      ),
    ),
    throwTE,
  );
};
