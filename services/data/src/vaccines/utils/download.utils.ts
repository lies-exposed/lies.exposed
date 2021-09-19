import * as fs from "fs";
import { GetLogger } from "@econnessione/core/logger";
import { APIRESTClient } from "@econnessione/ui/http";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";

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
