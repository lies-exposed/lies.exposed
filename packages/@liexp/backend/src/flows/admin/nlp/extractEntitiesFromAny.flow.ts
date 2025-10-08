import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import {
  ExtractEntitiesWithNLPInput,
  type ExtractEntitiesWithNLPFromResourceInput,
  type ExtractEntitiesWithNLPOutput,
} from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { toRecord } from "fp-ts/lib/ReadonlyRecord.js";
import { Equal } from "typeorm";
import { type ConfigContext } from "../../../context/config.context.js";
import { type DatabaseContext } from "../../../context/db.context.js";
import { type FSClientContext } from "../../../context/fs.context.js";
import { type HTTPProviderContext } from "../../../context/http.context.js";
import { type NERProviderContext } from "../../../context/index.js";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PDFProviderContext } from "../../../context/pdf.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { type LinkEntity } from "../../../entities/Link.entity.js";
import { ServerError } from "../../../errors/ServerError.js";
import { getOlderThanOr } from "../../../flows/fs/getOlderThanOr.flow.js";
import {
  ActorRepository,
  EventRepository,
  GroupRepository,
  KeywordRepository,
  LinkRepository,
} from "../../../services/entity-repository.service.js";
import { LoggerService } from "../../../services/logger/logger.service.js";
import { GetEncodeUtils } from "../../../utils/encode.utils.js";
import { extractRelationsFromPDFs } from "./extractRelationsFromPDF.flow.js";
import { extractRelationsFromText } from "./extractRelationsFromText.flow.js";
import { extractRelationsFromURL } from "./extractRelationsFromURL.flow.js";

const findOneResourceAndMapText = <C extends DatabaseContext>(
  body: ExtractEntitiesWithNLPFromResourceInput,
): ReaderTaskEither<C, ServerError, string> => {
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
        k.excerpt && isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
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
        k.excerpt && isValidValue(k.excerpt) ? getTextContents(k.excerpt) : "",
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
        () => ServerError.of(["Event has no excerpt"]),
      ),
      fp.RTE.map(({ excerpt }) =>
        excerpt && isValidValue(excerpt) ? getTextContents(excerpt) : "",
      ),
    );
  }

  if (body.resource === "links") {
    return pipe(
      LinkRepository.findOneOrFail({ where: { id: Equal(body.uuid) } }),
      fp.RTE.filterOrElse(
        (k): k is LinkEntity & { description: string } => !!k.description,
        () => ServerError.of(["Link has no description"]),
      ),
      fp.RTE.map((t) => t.description),
    );
  }

  return fp.RTE.left(
    ServerError.of(["Invalid resource", JSON.stringify(body)]),
  );
};

const extractEntitiesFromAny = <
  C extends PuppeteerProviderContext &
    ConfigContext &
    FSClientContext &
    LoggerContext &
    PDFProviderContext &
    NERProviderContext &
    DatabaseContext &
    HTTPProviderContext,
>(
  body: ExtractEntitiesWithNLPInput,
): ReaderTaskEither<C, ServerError, ExtractEntitiesWithNLPOutput> => {
  return pipe(
    fp.RTE.ask<C>(),
    LoggerService.RTE.debug(() => [
      "Extracting entities from any body %O",
      body,
    ]),
    fp.RTE.chain((ctx) => {
      if (Schema.is(ExtractEntitiesWithNLPInput.members[0])(body)) {
        return pipe(
          ctx.puppeteer.execute({}, (b, p) =>
            extractRelationsFromURL(p, body.url)(ctx),
          ),
          fp.RTE.fromTaskEither,
        );
      }

      if (Schema.is(ExtractEntitiesWithNLPInput.members[1])(body)) {
        return pipe(
          ctx.puppeteer.execute({}, () =>
            extractRelationsFromPDFs(body.pdf)(ctx),
          ),
          fp.RTE.fromTaskEither,
        );
      }

      if (Schema.is(ExtractEntitiesWithNLPInput.members[2])(body)) {
        return extractRelationsFromText(body.text);
      }

      if (Schema.is(ExtractEntitiesWithNLPInput.members[3])(body)) {
        return pipe(
          findOneResourceAndMapText(body),
          fp.RTE.chain((text) => extractRelationsFromText(text)),
        );
      }
      return fp.RTE.left(
        pipe(
          Schema.decodeUnknownEither(ExtractEntitiesWithNLPInput)(body),
          (either) => {
            if (fp.E.isLeft(either)) {
              return DecodeError.of("Failed to decode body", either.left);
            }
            return ServerError.of(["Invalid body"]);
          },
        ),
      );
    }),
  );
};

const entitiesHashEncoder = GetEncodeUtils<any>((r) =>
  toRecord<string, string>(r),
);

export const extractEntitiesFromAnyCached = <
  C extends ConfigContext &
    FSClientContext &
    DatabaseContext &
    LoggerContext &
    PDFProviderContext &
    NERProviderContext &
    PuppeteerProviderContext &
    HTTPProviderContext,
>(
  body: ExtractEntitiesWithNLPInput,
): ReaderTaskEither<C, ServerError, ExtractEntitiesWithNLPOutput> => {
  const bodyHash = entitiesHashEncoder.hash(body);

  return pipe(
    fp.RTE.ask<C>(),
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

export const readExtractedEntities =
  <C extends FSClientContext & ConfigContext>(
    body: ExtractEntitiesWithNLPInput,
  ): ReaderTaskEither<C, ServerError, ExtractEntitiesWithNLPOutput> =>
  (ctx) => {
    const bodyHash = entitiesHashEncoder.hash(body);
    return pipe(
      ctx.fs.resolve(
        path.resolve(ctx.config.dirs.temp.nlp, `${bodyHash}.json`),
      ),
      fp.TE.right,
      fp.TE.chain((path) => ctx.fs.getObject(path)),
      fp.TE.map(JSON.parse),
    );
  };
