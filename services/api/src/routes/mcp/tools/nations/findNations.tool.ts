import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { NationIO } from "@liexp/backend/lib/io/Nation.io.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { toControllerError } from "../../../../io/ControllerError.js";
import { formatNationToMarkdown } from "../formatters/nationToMarkdown.formatter.js";

export const FindNationsInputSchema = Schema.Struct({
  name: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Search query string to filter nations by name (partial match supported)",
  }),
  isoCode: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter by ISO country code (e.g., 'US', 'IT', 'FR')",
  }),
});
export type FindNationsInputSchema = typeof FindNationsInputSchema.Type;

export const findNationsToolTask = ({
  name,
  isoCode,
}: FindNationsInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      pipe(
        ctx.db.execQuery((em) => {
          const qb = em
            .createQueryBuilder(NationEntity, "nations")
            .loadAllRelationIds({ relations: ["actors"] });

          if (name) {
            qb.andWhere("LOWER(nations.name) LIKE :name", {
              name: `%${name.toLowerCase()}%`,
            });
          }

          if (isoCode) {
            qb.andWhere("UPPER(nations.isoCode) = :isoCode", {
              isoCode: isoCode.toUpperCase(),
            });
          }

          return qb.getManyAndCount();
        }),
        fp.TE.mapLeft((e) => toControllerError(e)),
      ),
    ),
    LoggerService.RTE.debug("Nation query results: %O"),
    fp.RTE.chainEitherK(([nations]) => NationIO.decodeMany(nations)),
    fp.RTE.map((decodedNations) => {
      if (decodedNations.length === 0) {
        return {
          content: [
            {
              text: `No nations found matching the search criteria${name ? ` for "${name}"` : ""}${isoCode ? ` with ISO code "${isoCode}"` : ""}.`,
              type: "text" as const,
            },
          ],
        };
      }
      return {
        content: decodedNations.map((nation) => ({
          text: formatNationToMarkdown(nation),
          type: "text" as const,
          href: `nation://${nation.id}`,
        })),
      };
    }),
  );
};
