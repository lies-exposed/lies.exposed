import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import * as Link from "@liexp/io/lib/http/Link.js";
import { IOError } from "@ts-endpoint/core";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";

/**
 * When a story is being published (`draft: false`), ensure none of the
 * related links are still in DRAFT status.
 *
 * Returns `TE.right(undefined)` when the transition is allowed, or a 400
 * `IOError` listing the offending link URLs otherwise.
 */
export const validateStoryPublish =
  (
    draft: boolean,
    linkIds: readonly UUID[],
  ): ReaderTaskEither<DatabaseContext, IOError, void> =>
  (ctx) => {
    if (draft || linkIds.length === 0) {
      return TE.right(undefined);
    }

    return pipe(
      ctx.db.find(LinkEntity, {
        where: { id: In(linkIds), status: Link.DRAFT.literals[0] },
        select: ["id", "url"],
      }),
      TE.chain((draftLinks) => {
        if (draftLinks.length === 0) {
          return TE.right(undefined);
        }
        return TE.left(
          new IOError(
            `Cannot publish story: ${draftLinks.length} related link(s) are still in DRAFT status`,
            {
              kind: "ClientError",
              status: "400",
              meta: draftLinks.map((l) => l.url),
            },
          ),
        );
      }),
    );
  };
