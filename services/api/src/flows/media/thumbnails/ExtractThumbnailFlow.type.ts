import { type TEReader } from "#flows/flow.types.js";

export type ExtractThumbnailFromMediaFlow<T> = (
  r: T,
) => TEReader<ArrayBuffer[]>;
