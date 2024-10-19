import path from "path";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { GetEncodeUtils } from "@liexp/backend/lib/utils/encode.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  ExtractEntitiesWithNLPInput,
  type ExtractEntitiesWithNLPFromResourceInput,
  type ExtractEntitiesWithNLPOutput,
} from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { getTextContents } from "@liexp/ui/lib/components/Common/BlockNote/utils/getTextContents.js";
import { isValidValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/isValidValue.js";
import { toRecord } from "fp-ts/lib/ReadonlyRecord.js";
import { Equal } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOlderThanOr } from "#flows/fs/getOlderThanOr.flow.js";
import { extractRelationsFromPDFs } from "#flows/nlp/extractRelationsFromPDF.flow.js";
import { extractRelationsFromText } from "#flows/nlp/extractRelationsFromText.flow.js";
import { extractRelationsFromURL } from "#flows/nlp/extractRelationsFromURL.flow.js";
import {
  BadRequestError,
  DecodeError,
  ServerError,
} from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const findOneResourceAndMapText = (
  body: ExtractEntitiesWithNLPFromResourceInput,
): TEReader<string> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.chainIOK((ctx) => () => {
      if (body.resource === "keywords") {
        return pipe(
          ctx.db.findOneOrFail(KeywordEntity, {
            where: {
              id: Equal(body.uuid),
            },
          }),
          fp.TE.map((k) => k.tag),
        );
      }

      if (body.resource === "groups") {
        return pipe(
          ctx.db.findOneOrFail(GroupEntity, {
            where: {
              id: Equal(body.uuid),
            },
          }),
          fp.TE.map((k) =>
            isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
          ),
        );
      }

      if (body.resource === "actors") {
        return pipe(
          ctx.db.findOneOrFail(ActorEntity, {
            where: {
              id: Equal(body.uuid),
            },
          }),
          fp.TE.map((k) =>
            isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
          ),
        );
      }

      if (body.resource === "events") {
        return pipe(
          ctx.db.findOneOrFail(EventV2Entity, {
            where: {
              id: Equal(body.uuid),
            },
          }),
          fp.TE.map((k) =>
            isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
          ),
        );
      }

      if (body.resource === "links") {
        return pipe(
          ctx.db.findOneOrFail(LinkEntity, {
            where: {
              id: Equal(body.uuid),
            },
          }),
          fp.TE.map((k) => k.description),
        );
      }

      return fp.TE.left(
        ServerError(["Invalid resource", JSON.stringify(body)]),
      );
    }),
    fp.RTE.chainTaskEitherK((te) => te),
  );
};

export const extractEntitiesFromAny = (
  body: ExtractEntitiesWithNLPInput,
): TEReader<ExtractEntitiesWithNLPOutput> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    LoggerService.RTE.debug(() => [
      "Extracting entities from any body %O",
      body,
    ]),
    fp.RTE.chain((ctx) => {
      if (ExtractEntitiesWithNLPInput.types[0].is(body)) {
        return pipe(
          ctx.puppeteer.execute({}, (b, p) =>
            extractRelationsFromURL(p, body.url)(ctx),
          ),
          fp.RTE.fromTaskEither,
        );
      }

      if (ExtractEntitiesWithNLPInput.types[1].is(body)) {
        return pipe(
          ctx.puppeteer.execute({}, (b, p) =>
            extractRelationsFromPDFs(body.pdf)(ctx),
          ),
          fp.RTE.fromTaskEither,
        );
      }

      if (ExtractEntitiesWithNLPInput.types[2].is(body)) {
        return extractRelationsFromText(body.text);
      }

      if (ExtractEntitiesWithNLPInput.types[3].is(body)) {
        return pipe(
          findOneResourceAndMapText(body),
          fp.RTE.chain((text) => extractRelationsFromText(text)),
        );
      }
      return fp.RTE.left(
        pipe(ExtractEntitiesWithNLPInput.decode(body), (either) => {
          if (fp.E.isLeft(either)) {
            return DecodeError("Failed to decode body", either.left);
          }
          return BadRequestError("Invalid body");
        }),
      );
    }),
  );
};

export const extractEntitiesFromAnyCached = (
  body: ExtractEntitiesWithNLPInput,
): TEReader<ExtractEntitiesWithNLPOutput> => {
  const bodyHash = GetEncodeUtils((r) =>
    toRecord<string, string>(r as any),
  ).hash(body);

  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.map((ctx) =>
      ctx.fs.resolve(
        path.resolve(ctx.config.dirs.temp.nlp, `${bodyHash}.json`),
      ),
    ),

    fp.RTE.chain((filePath) =>
      getOlderThanOr(filePath, 60 * 60 * 1000)(extractEntitiesFromAny(body)),
    ),
  );
};
