import path from "path";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getTextContents } from "@liexp/react-page/lib/utils.js";
import {
  ExtractEntitiesWithNLPInput,
  type ExtractEntitiesWithNLPFromResourceInput,
  type ExtractEntitiesWithNLPOutput,
} from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { GetEncodeUtils } from "@liexp/shared/lib/utils/encode.utils.js";
import { toRecord } from "fp-ts/lib/ReadonlyRecord.js";
import { Equal } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { LinkEntity } from '#entities/Link.entity';
import { type TEFlow } from "#flows/flow.types.js";
import { extractRelationsFromText } from "#flows/nlp/extractRelationsFromText.flow.js";
import { extractRelationsFromURL } from "#flows/nlp/extractRelationsFromURL.flow.js";
import {
  BadRequestError,
  DecodeError,
  ServerError,
  toControllerError,
} from "#io/ControllerError.js";
import { editor } from "#providers/slate.js";

const findOneResourceAndMapText: TEFlow<
  [ExtractEntitiesWithNLPFromResourceInput],
  string
> = (ctx) => (body) => {
  return pipe(
    () => {
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
            k.body ? getTextContents(editor.liexpSlate)(k.body as any) : "",
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
            k.body ? getTextContents(editor.liexpSlate)(k.body as any) : "",
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
            k.excerpt
              ? getTextContents(editor.liexpSlate)(k.excerpt as any)
              : "",
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
    },
    fp.TE.fromIO,
    fp.TE.chain((te) => te),
  );
};

export const extractEntitiesFromAny: TEFlow<
  [ExtractEntitiesWithNLPInput],
  ExtractEntitiesWithNLPOutput
> = (ctx) => (body) => {
  ctx.logger.debug.log("extract entities from any body %O", body);
  return pipe(
    () => {
      if (ExtractEntitiesWithNLPInput.types[0].is(body)) {
        return pipe(
          ctx.puppeteer.getBrowserFirstPage("about:blank", {
          }),
          fp.TE.mapLeft(toControllerError),
          fp.TE.chain((p) =>
            pipe(
              extractRelationsFromURL(ctx)(p, body.url),
              fp.TE.chainFirst(() =>
                fp.TE.tryCatch(async () => {
                  await p.browser().close();
                }, toControllerError),
              ),
            ),
          ),
        );
      }

      if (ExtractEntitiesWithNLPInput.types[1].is(body)) {
        return extractRelationsFromText(ctx)(body.text);
      }

      if (ExtractEntitiesWithNLPInput.types[2].is(body)) {
        return pipe(
          findOneResourceAndMapText(ctx)(body),
          fp.TE.chain((text) => extractRelationsFromText(ctx)(text)),
        );
      }
      return fp.TE.left(
        pipe(ExtractEntitiesWithNLPInput.decode(body), (either) => {
          if (fp.E.isLeft(either)) {
            return DecodeError("Failed to decode body", either.left);
          }
          return BadRequestError("Invalid body");
        }),
      );
    },
    fp.TE.fromIO,
    fp.TE.chain((te) => te),
  );
};

export const extractEntitiesFromAnyCached: TEFlow<
  [ExtractEntitiesWithNLPInput],
  ExtractEntitiesWithNLPOutput
> = (ctx) => (body) => {
  const bodyHash = GetEncodeUtils((r) =>
    toRecord<string, string>(r as any),
  ).hash(body);
  const filePath = ctx.fs.resolve(
    path.resolve(ctx.config.dirs.temp.nlp, `${bodyHash}.json`),
  );
  return pipe(
    extractEntitiesFromAny(ctx)(body),
    ctx.fs.getOlderThanOr(filePath, 60 * 60 * 1000),
  );
};
