import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as A from "fp-ts/Array";
import * as TE from "fp-ts/TaskEither";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";

export const parsePhoto: TEFlow<
  [string, TelegramBot.PhotoSize[]],
  MediaEntity[]
> =
  (ctx) =>
  (description, photo): TE.TaskEither<ControllerError, MediaEntity[]> => {
    return pipe(
      photo,
      A.map((p) => {
        const mediaId = uuid();
        return pipe(
          fp.IOE.tryCatch(
            () => ctx.tg.api.getFileStream(p.file_id),
            toControllerError,
          ),
          TE.fromIOEither,
          TE.chain((f) => {
            ctx.logger.debug.log("File downloaded %O", f);

            return createAndUpload(ctx)(
              {
                type: MediaType.types[0].value,
                location: p.file_id,
                label: description,
                description,
                thumbnail: undefined,
                extra: undefined,
                events: [],
                links: [],
                keywords: [],
                areas: [],
              },
              {
                Body: f,
              },
              mediaId,
              false,
            );
          }),
        );
      }),
      A.sequence(TE.ApplicativeSeq),
    );
  };
