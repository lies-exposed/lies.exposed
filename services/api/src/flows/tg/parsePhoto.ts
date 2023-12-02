import { MediaType } from "@liexp/shared/lib/io/http/Media";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as A from "fp-ts/Array";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type TelegramBot from "node-telegram-bot-api";
import { createAndUpload } from "../media/createAndUpload.flow";
import { type MediaEntity } from "@entities/Media.entity";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError, type ControllerError } from "@io/ControllerError";

export const parsePhoto: TEFlow<[string, TelegramBot.PhotoSize[]], MediaEntity[]> = (ctx) => (description, photo): TE.TaskEither<ControllerError, MediaEntity[]> => {
  return pipe(
    photo,
    A.map((p) => {
      const mediaId = uuid();
      return pipe(
        TE.tryCatch(
          async () => ctx.tg.api.getFileStream(p.file_id),
          toControllerError
        ),
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
            false
          );
        })
      );
    }),
    A.sequence(TE.ApplicativeSeq)
  );
};
