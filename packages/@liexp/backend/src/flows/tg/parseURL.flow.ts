import { pipe } from "@liexp/core/lib/fp/index.js";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { LINKS } from "@liexp/shared/lib/io/http/Link.js";
import {
  OpenAIEmbeddingQueueType,
  PendingStatus,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/Queue/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type UUID } from "io-ts-types";
import type * as puppeteer from "puppeteer-core";
import { Equal } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type QueuesProviderContext } from "../../context/queue.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { ServerError } from "../../errors/index.js";
import { type DBError } from "../../providers/orm/index.js";
import { LinkRepository } from "../../services/entity-repository.service.js";
import { LoggerService } from "../../services/logger/logger.service.js";
import { fromURL } from "../links/link.flow.js";
import { takeLinkScreenshot } from "../links/takeLinkScreenshot.flow.js";

export const parseURLs =
  <
    C extends LoggerContext &
      DatabaseContext &
      URLMetadataContext &
      QueuesProviderContext &
      PuppeteerProviderContext &
      SpaceContext &
      ENVContext,
  >(
    urls: O.Option<URL[]>,
    user: UserEntity,
    page: puppeteer.Page,
  ): ReaderTaskEither<C, DBError | ServerError, UUID[]> =>
  (ctx) =>
    pipe(
      urls,
      O.map((urls) =>
        urls.filter((u) => {
          const isURL = E.isRight(URL.decode(u));
          const isAllowed = !isExcludedURL(u);

          return isURL && isAllowed;
        }),
      ),
      O.getOrElse((): URL[] => []),
      A.map((url) => {
        return pipe(
          ctx.db.findOne<LinkEntity & { image: MediaEntity | null }>(
            LinkEntity,
            {
              where: {
                url: Equal(url),
              },
              relations: ["image"],
            },
          ),
          TE.chain((link) => {
            if (O.isSome(link)) {
              ctx.logger.info.log("Link found %s", link.value.id);
              return TE.right(link.value);
            }

            return pipe(
              fromURL(user, url, {})(ctx),
              TE.mapLeft(ServerError.fromUnknown),
              LoggerService.TE.info(ctx, ["Link created %O"]),
              TE.chain((link) =>
                pipe(
                  link.image?.thumbnail
                    ? TE.right(link)
                    : takeLinkScreenshot(link)(ctx),
                ),
              ),
              TE.chainFirst((l) =>
                ctx.queue.queue(OpenAIEmbeddingQueueType.value).addJob({
                  id: l.id,
                  status: PendingStatus.value,
                  type: OpenAIEmbeddingQueueType.value,
                  resource: LINKS.value,
                  error: null,
                  question: null,
                  result: null,
                  prompt: null,
                  data: {
                    url: l.url,
                    type: "link",
                  },
                } as Queue),
              ),
              TE.mapLeft(ServerError.fromUnknown),
            );
          }),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
      TE.chain((links) => LinkRepository.save(links)(ctx)),
      TE.map((links) => links.map(({ id }) => id)),
    );
