import path from "path";
import { getOlderThanOr } from "@liexp/backend/lib/flows/fs/getOlderThanOr.flow.js";
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
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";
import { extractRelationsFromPDFs } from "#flows/nlp/extractRelationsFromPDF.flow.js";
import { extractRelationsFromText } from "#flows/nlp/extractRelationsFromText.flow.js";
import { extractRelationsFromURL } from "#flows/nlp/extractRelationsFromURL.flow.js";
import {
  BadRequestError,
  DecodeError,
  ServerError,
  toControllerError,
} from "#io/ControllerError.js";
import {
  ActorRepository,
  EventRepository,
  GroupRepository,
  KeywordRepository,
  LinkRepository,
} from "#providers/db/entity-repository.provider.js";

const findOneResourceAndMapText = (
  body: ExtractEntitiesWithNLPFromResourceInput,
): TEReader<string> => {
  if (body.resource === "keywords") {
    return pipe(
      KeywordRepository.findOneOrFail({
        where: {
          id: Equal(body.uuid),
        },
      }),
      fp.RTE.map((k) => k.tag),
    );
  }

  if (body.resource === "groups") {
    return pipe(
      GroupRepository.findOneOrFail({
        where: {
          id: Equal(body.uuid),
        },
      }),
      fp.RTE.map((k) =>
        isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
      ),
    );
  }

  if (body.resource === "actors") {
    return pipe(
      ActorRepository.findOneOrFail({
        where: {
          id: Equal(body.uuid),
        },
      }),
      fp.RTE.map((k) =>
        isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
      ),
    );
  }

  if (body.resource === "events") {
    return pipe(
      EventRepository.findOneOrFail({
        where: {
          id: Equal(body.uuid),
        },
      }),
      fp.RTE.filterOrElse(
        (k) => isValidValue(k.excerpt),
        () => toControllerError("Event has no excerpt"),
      ),
      fp.RTE.map((t) =>
        isValidValue(t.excerpt) ? getTextContents(t.excerpt) : "",
      ),
    );
  }

  if (body.resource === "links") {
    return pipe(
      LinkRepository.findOneOrFail({ where: { id: Equal(body.uuid) } }),
      fp.RTE.filterOrElse(
        (k) => !!k.description,
        () => toControllerError("Link has no description"),
      ),
      fp.RTE.map((t): string => t.description as any),
    );
  }

  return fp.RTE.left(ServerError(["Invalid resource", JSON.stringify(body)]));
};

export const extractEntitiesFromAny = (
  body: ExtractEntitiesWithNLPInput,
): TEReader<ExtractEntitiesWithNLPOutput> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
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
    fp.RTE.ask<ServerContext>(),
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
