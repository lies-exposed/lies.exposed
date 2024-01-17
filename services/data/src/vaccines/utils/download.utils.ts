import * as fs from "fs";
import { GetLogger } from "@liexp/core/lib/logger";
import { APIRESTClient } from "@liexp/ui/lib/http";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";

const log = GetLogger("download-utils");

interface DownloadFileToOpts {
  client: APIRESTClient;
  url: string;
  outputPath: string;
}

export const DownloadTask = ({
  client,
  url,
  outputPath,
}: DownloadFileToOpts): TE.TaskEither<Error, void> => {
  return TE.tryCatch(async () => {
    if (fs.existsSync(outputPath)) {
      log.debug.log("Vaccine distribution data already exists! Resolving...");
      return await Promise.resolve(undefined);
    }
    const content = await client.get(url, {});
    fs.writeFileSync(outputPath, content);
    return await Promise.resolve(undefined);
  }, E.toError);
};
