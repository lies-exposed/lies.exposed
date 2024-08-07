import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { type TEFlow } from "#flows/flow.types.js";

export type ExtractThumbnailFromMediaFlow<T> = TEFlow<
  [Pick<Media.Media, "id" | "location"> & { type: T }],
  ArrayBuffer[]
>;
