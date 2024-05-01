/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */

// other imports
import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Geometry } from "@liexp/shared/lib/io/http/Common/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { toBNDocumentTE } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { JsonContains } from "typeorm";
import { startContext, stopContext } from "./start-ctx.js";
import { AreaEntity } from "#entities/Area.entity.js";
import { toControllerError } from "#io/ControllerError.js";
const parseKMZ = require("parse2-kmz");

interface GEOFeature {
  type: "Feature";
  geometry: Geometry.Geometry;
  properties: {
    name: string;
  };
}

const run = async (): Promise<any> => {
  const ctx = await startContext();
  const [, , pathToKMZ] = process.argv;

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
            toBNDocumentTE(f.properties.name),
            TE.mapLeft(toControllerError),
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

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().catch(console.error);
