import { type PutObjectCommandInput } from "@aws-sdk/client-s3";
import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { type TEFlow } from "#flows/flow.types.js";

export type ExtractThumbnailFlow<T> = TEFlow<
  [Pick<Media.Media, "id" | "location"> & { type: T }],
  PutObjectCommandInput[]
>;
