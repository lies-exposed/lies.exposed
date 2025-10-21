import { Document } from "@langchain/core/documents";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ClientContextRTE } from "../../../types.js";

export const loadText = (text: string): ClientContextRTE<Document[]> => {
  return pipe(
    LoggerService.debug(() => [
      "Loading text in documents %s",
      text.substring(0, 30).concat("..."),
    ]),
    fp.RTE.fromReader,
    fp.RTE.map(() =>
      text.split("\n").map((line) => new Document({ pageContent: line })),
    ),
  );
};
