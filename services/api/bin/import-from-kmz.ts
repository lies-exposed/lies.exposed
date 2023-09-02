/* eslint-disable import/first */
/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());

// other imports
import path from "path";
import { fp } from "@liexp/core/lib/fp";
import { type Geometry } from "@liexp/shared/lib/io/http/Common";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { JsonContains } from "typeorm";
import { startContext, stopContext } from "./start-ctx";
import { AreaEntity } from "@entities/Area.entity";
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
  const [,,pathToKMZ] = process.argv

  const result = await pipe(
    TE.tryCatch(() => {
      return parseKMZ.toJson(
        path.resolve(process.cwd(), pathToKMZ),
      );
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
            ctx.db.save(AreaEntity, [
              {
                ...currentArea,
                label: f.properties.name,
                geometry: f.geometry,
                body: createExcerptValue(f.properties.name),
              },
            ]),
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
