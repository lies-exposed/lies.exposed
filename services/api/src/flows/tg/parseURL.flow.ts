import { pipe } from "@liexp/core/lib/fp/index.js";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { LINKS } from "@liexp/shared/lib/io/http/Link.js";
import {
  OpenAIEmbeddingQueueType,
  PendingStatus,
} from "@liexp/shared/lib/io/http/Queue.js";
import { EMBED_LINK_PROMPT } from "@liexp/shared/lib/io/openai/prompts/link.prompts.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { Equal } from "typeorm";
import { LinkEntity } from "#entities/Link.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { takeLinkScreenshotAndSave } from "#flows/links/takeLinkScreenshot.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const parseURLs =
  (
    urls: O.Option<URL[]>,
    user: UserEntity,
    page: puppeteer.Page,
  ): TEReader<LinkEntity[]> =>
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
          ctx.db.findOne(LinkEntity, {
            where: {
              url: Equal(url),
            },
          }),
          TE.chain((link) => {
            if (O.isSome(link)) {
              ctx.logger.info.log("Link found %s", link.value.id);
              return TE.right(link.value);
            }

            return pipe(
              fetchAndSave(user, url)(ctx),
              TE.chain((link) =>
                pipe(
                  link.image?.thumbnail
                    ? TE.right(link)
                    : takeLinkScreenshotAndSave(link)(ctx),
                ),
              ),
              TE.chainFirst((l) =>
                ctx.queue.queue(OpenAIEmbeddingQueueType.value).addJob({
                  id: uuid(),
                  status: PendingStatus.value,
                  type: OpenAIEmbeddingQueueType.value,
                  resource: LINKS.value,
                  error: null,
                  data: {
                    url: l.url,
                    type: "link",
                    result: undefined,
                    prompt: EMBED_LINK_PROMPT,
                  },
                }),
              ),
              TE.mapLeft(toControllerError),
            );
          }),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
    );
