// other imports
import path from "path";
import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { JsonContains } from "typeorm";
import { toWorkerError } from "../io/worker.error.js";
import { type CommandFlow } from "./command.type.js";

interface GEOFeature {
  type: "Feature";
  geometry: Geometry.Geometry;
  properties: {
    name: string;
  };
}

export const importFromKMZ: CommandFlow = async (ctx, args) => {
  const [pathToKMZ] = args;

  const parseKMZ = await import("parse2-kmz");

  const result = await pipe(
    TE.tryCatch(() => {
      return parseKMZ.toJson(path.resolve(process.cwd(), pathToKMZ));
    }, fp.E.toError),
    TE.map((f: any): GEOFeature[] => f.features),
    throwTE,
  );

  const entities = await pipe(
    result,
    fp.A.traverse(TE.ApplicativePar)((f) => {
      return pipe(
        ctx.db.findOne(AreaEntity, {
          where: {
            geometry: JsonContains(f.geometry),
          },
        }),
        TE.chain((area) => {
          const currentArea = fp.O.isSome(area) ? area.value : {};

          return pipe(
            toInitialValue(f.properties.name),
            TE.right,
            TE.mapLeft(toWorkerError),
            TE.chain((body) =>
              ctx.db.save(AreaEntity, [
                {
                  ...currentArea,
                  label: f.properties.name,
                  geometry: f.geometry,
                  body: body,
                },
              ]),
            ),
            TE.map((data) => data[0]),
          );
        }),
      );
    }),
    throwTE,
  );

  ctx.logger.info.log("Output: %O", entities);
};
