import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type FSClientContext } from "@liexp/backend/lib/context/fs.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Schema } from "effect";
import { parseJson } from "effect/Schema";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ControllerError } from "../io/ControllerError.js";

const CountryJSON = Schema.Struct({
  name: Schema.String,
  iso: Schema.String,
});

export const seedNations = <
  C extends DatabaseContext & FSClientContext & LoggerContext,
>(
  ctx: C,
): TaskEither<ControllerError, void> => {
  ctx.logger.debug.log("Seeding countries...");
  return pipe(
    fp.TE.Do,
    fp.TE.apS(
      "countries",
      pipe(
        ctx.fs.getObject(ctx.fs.resolve("config/countries.json")),
        fp.TE.chainEitherK((json) =>
          pipe(
            Schema.decodeUnknownEither(parseJson(Schema.Array(CountryJSON)))(
              json,
            ),
            fp.E.mapLeft((e) => DecodeError.of("Failed", e)),
          ),
        ),
      ),
    ),
    fp.TE.bindW("nations", () => ctx.db.find(NationEntity)),
    fp.TE.bindW("newCountries", ({ nations, countries }) =>
      pipe(
        nations.map((n) => n.isoCode),
        (nations) => countries.filter((c) => !nations.includes(c.iso)),
        fp.TE.right,
      ),
    ),
    fp.TE.chain(({ nations: _nations, newCountries }) =>
      ctx.db.save(
        NationEntity,
        newCountries.map(({ iso, ...c }) => ({ ...c, isoCode: iso })),
      ),
    ),
    LoggerService.TE.debug(ctx, (countries) => [
      "New nations saved %j",
      countries,
    ]),
    fp.TE.map(() => undefined),
  );
};
